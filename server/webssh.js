const { Server } = require('socket.io');
const { Client } = require('ssh2');

let io;

function initWebSSH(httpServer) {
  io = new Server(httpServer, {
    path: '/socket.io',
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('WebSSH client connected:', socket.id);
    
    let sshClient = null;
    let sshStream = null;

    socket.on('ssh-connect', (config) => {
      console.log('SSH connection request:', { 
        host: config.host, 
        port: config.port, 
        username: config.username,
        authMethod: config.authMethod 
      });
      
      sshClient = new Client();
      
      sshClient.on('ready', () => {
        console.log('SSH connection ready');
        socket.emit('ssh-status', { status: 'connected' });
        
        sshClient.shell({ term: 'xterm-256color' }, (err, stream) => {
          if (err) {
            console.error('Shell error:', err);
            socket.emit('ssh-error', { message: err.message });
            return;
          }
          
          sshStream = stream;
          
          stream.on('data', (data) => {
            socket.emit('ssh-output', data.toString('utf-8'));
          });
          
          stream.on('close', () => {
            console.log('SSH stream closed');
            socket.emit('ssh-status', { status: 'disconnected' });
            sshClient.end();
          });
          
          stream.stderr.on('data', (data) => {
            socket.emit('ssh-output', data.toString('utf-8'));
          });
        });
      });
      
      sshClient.on('error', (err) => {
        console.error('SSH connection error:', err);
        socket.emit('ssh-error', { message: err.message });
      });
      
      sshClient.on('close', () => {
        console.log('SSH connection closed');
        socket.emit('ssh-status', { status: 'disconnected' });
      });
      
      try {
        // 构建连接配置
        const connectionConfig = {
          host: config.host,
          port: config.port || 22,
          username: config.username,
          readyTimeout: 30000,
          keepaliveInterval: 5000,
          keepaliveCountMax: 10,
          tryKeyboard: true,
          algorithms: {
            serverHostKey: ['ssh-rsa', 'ssh-dss', 'ecdsa-sha2-nistp256', 'ecdsa-sha2-nistp384', 'ecdsa-sha2-nistp521'],
          }
        };

        // 根据认证方式添加相应的认证信息
        if (config.authMethod === 'private_key' && config.privateKey) {
          // 确保私钥格式正确（处理可能的转义字符）
          let privateKey = config.privateKey;
          
          // 如果私钥包含 \n 字符串而不是真正的换行符，进行替换
          if (privateKey.includes('\\n')) {
            privateKey = privateKey.replace(/\\n/g, '\n');
          }
          
          connectionConfig.privateKey = Buffer.from(privateKey, 'utf8');
          
          // 如果提供了密码，可能是私钥的 passphrase
          if (config.password) {
            connectionConfig.passphrase = config.password;
          }
          
          console.log('Using private key authentication');
          console.log('Private key length:', privateKey.length);
          console.log('Private key starts with:', privateKey.substring(0, 50));
        } else {
          connectionConfig.password = config.password;
          console.log('Using password authentication');
        }

        sshClient.connect(connectionConfig);
      } catch (err) {
        console.error('SSH connect error:', err);
        socket.emit('ssh-error', { message: err.message });
      }
    });
    
    socket.on('ssh-input', (data) => {
      if (sshStream && sshStream.writable) {
        sshStream.write(data);
      }
    });
    
    socket.on('ssh-resize', ({ rows, cols }) => {
      if (sshStream) {
        sshStream.setWindow(rows, cols);
      }
    });
    
    socket.on('ssh-disconnect', () => {
      if (sshClient) {
        sshClient.end();
      }
    });
    
    socket.on('disconnect', () => {
      console.log('WebSSH client disconnected:', socket.id);
      if (sshClient) {
        sshClient.end();
      }
    });

    // SFTP 文件传输功能
    socket.on('sftp-list-dir', (data) => {
      console.log('Received sftp-list-dir request:', data);
      const { path } = data;
      
      if (!sshClient) {
        console.error('SSH client not available for SFTP');
        socket.emit('sftp-error', { message: 'SSH 未连接' });
        return;
      }

      console.log('Creating SFTP session...');
      sshClient.sftp((err, sftp) => {
        if (err) {
          console.error('SFTP session creation error:', err);
          socket.emit('sftp-error', { message: err.message });
          return;
        }

        console.log('SFTP session created, reading directory:', path || '.');
        sftp.readdir(path || '.', (err, list) => {
          if (err) {
            console.error('SFTP readdir error:', err);
            socket.emit('sftp-error', { message: err.message });
            return;
          }

          console.log('Directory read successfully, files count:', list.length);
          const files = list.map(item => ({
            name: item.filename,
            type: item.attrs.isDirectory() ? 'directory' : 'file',
            size: item.attrs.size,
            modifyTime: item.attrs.mtime * 1000,
            permissions: item.attrs.mode,
          }));

          console.log('Emitting sftp-dir-list with', files.length, 'files');
          socket.emit('sftp-dir-list', { path, files });
        });
      });
    });

    socket.on('sftp-upload-file', (data) => {
      const { remotePath, fileData, fileName } = data;
      console.log('Upload request for:', fileName);
      
      if (!sshClient) {
        console.error('SSH client not available for upload');
        socket.emit('sftp-error', { message: 'SSH 未连接' });
        return;
      }

      sshClient.sftp((err, sftp) => {
        if (err) {
          console.error('SFTP error:', err);
          socket.emit('sftp-error', { message: err.message });
          return;
        }

        const buffer = Buffer.from(fileData, 'base64');
        const fullPath = remotePath.endsWith('/') ? remotePath + fileName : remotePath + '/' + fileName;
        const totalSize = buffer.length;
        let uploadedBytes = 0;

        console.log(`Uploading ${fileName}, size: ${totalSize} bytes to ${fullPath}`);

        const writeStream = sftp.createWriteStream(fullPath);
        let uploadCompleted = false;
        
        writeStream.on('error', (err) => {
          console.error('SFTP upload stream error:', err);
          if (!uploadCompleted) {
            uploadCompleted = true;
            socket.emit('sftp-upload-error', { message: err.message, fileName });
          }
        });

        writeStream.on('drain', () => {
          // 数据已写入，更新进度
          const progress = Math.min(Math.round((uploadedBytes / totalSize) * 50) + 50, 100);
          console.log(`Upload progress for ${fileName}: ${progress}%`);
          socket.emit('sftp-upload-progress', { fileName, progress });
        });

        writeStream.on('finish', () => {
          if (!uploadCompleted) {
            uploadCompleted = true;
            console.log('File uploaded successfully:', fullPath);
            socket.emit('sftp-upload-progress', { fileName, progress: 100 });
            socket.emit('sftp-upload-success', { fileName, remotePath: fullPath });
          }
        });

        writeStream.on('close', () => {
          console.log('Upload stream closed for:', fileName);
        });

        // 分块写入以支持大文件和进度报告
        const chunkSize = 64 * 1024; // 64KB chunks
        let offset = 0;

        const writeChunk = () => {
          if (offset >= totalSize) {
            writeStream.end();
            return;
          }

          const chunk = buffer.slice(offset, Math.min(offset + chunkSize, totalSize));
          const canContinue = writeStream.write(chunk);
          
          uploadedBytes = offset + chunk.length;
          offset += chunk.length;

          // 计算进度 (50-100%)
          const progress = Math.min(Math.round((uploadedBytes / totalSize) * 50) + 50, 100);
          socket.emit('sftp-upload-progress', { fileName, progress });

          if (canContinue && offset < totalSize) {
            // 继续写入下一块
            setImmediate(writeChunk);
          } else if (!canContinue) {
            // 等待 drain 事件
            writeStream.once('drain', writeChunk);
          }
        };

        // 开始写入
        writeChunk();
      });
    });

    socket.on('sftp-download-file', (data) => {
      const { remotePath } = data;
      console.log('Download request for:', remotePath);
      
      if (!sshClient) {
        socket.emit('sftp-error', { message: 'SSH 未连接' });
        return;
      }

      sshClient.sftp((err, sftp) => {
        if (err) {
          console.error('SFTP error:', err);
          socket.emit('sftp-error', { message: err.message });
          return;
        }

        // 先获取文件信息
        sftp.stat(remotePath, (err, stats) => {
          if (err) {
            console.error('SFTP stat error:', err);
            socket.emit('sftp-download-error', { message: err.message });
            return;
          }

          const fileSize = stats.size;
          const fileName = remotePath.split('/').pop();
          console.log(`Downloading ${fileName}, size: ${fileSize} bytes`);

          // 发送开始下载事件
          socket.emit('sftp-download-start', { fileName, fileSize });

          // 使用流式读取
          const readStream = sftp.createReadStream(remotePath);
          const chunks = [];
          let downloadedBytes = 0;
          const startTime = Date.now();

          readStream.on('data', (chunk) => {
            chunks.push(chunk);
            downloadedBytes += chunk.length;
            
            // 计算进度和速度
            const progress = Math.round((downloadedBytes / fileSize) * 100);
            const elapsedTime = (Date.now() - startTime) / 1000; // 秒
            const speed = downloadedBytes / elapsedTime; // 字节/秒

            // 每接收一定数据量报告一次进度（避免过于频繁）
            // 对于小文件，每次都报告；对于大文件，每64KB报告一次
            const shouldReport = fileSize < 1024 * 1024 || 
                                downloadedBytes % (64 * 1024) < chunk.length || 
                                downloadedBytes === fileSize;
            
            if (shouldReport) {
              socket.emit('sftp-download-progress', {
                fileName,
                progress,
                downloadedBytes,
                totalBytes: fileSize,
                speed,
              });
            }
          });

          readStream.on('end', () => {
            console.log('Download completed:', fileName);
            const fileData = Buffer.concat(chunks).toString('base64');
            socket.emit('sftp-download-success', {
              fileName,
              fileData,
            });
          });

          readStream.on('error', (err) => {
            console.error('SFTP download stream error:', err);
            socket.emit('sftp-download-error', { message: err.message });
          });
        });
      });
    });

    socket.on('sftp-delete-file', (data) => {
      const { remotePath, type } = data;
      if (!sshClient) {
        socket.emit('sftp-error', { message: 'SSH 未连接' });
        return;
      }

      sshClient.sftp((err, sftp) => {
        if (err) {
          console.error('SFTP error:', err);
          socket.emit('sftp-error', { message: err.message });
          return;
        }

        const deleteFunc = type === 'directory' ? sftp.rmdir.bind(sftp) : sftp.unlink.bind(sftp);
        
        deleteFunc(remotePath, (err) => {
          if (err) {
            console.error('SFTP delete error:', err);
            socket.emit('sftp-delete-error', { message: err.message });
            return;
          }

          socket.emit('sftp-delete-success', { remotePath });
        });
      });
    });

    socket.on('sftp-create-dir', (data) => {
      const { remotePath } = data;
      if (!sshClient) {
        socket.emit('sftp-error', { message: 'SSH 未连接' });
        return;
      }

      sshClient.sftp((err, sftp) => {
        if (err) {
          console.error('SFTP error:', err);
          socket.emit('sftp-error', { message: err.message });
          return;
        }

        sftp.mkdir(remotePath, (err) => {
          if (err) {
            console.error('SFTP mkdir error:', err);
            socket.emit('sftp-create-dir-error', { message: err.message });
            return;
          }

          socket.emit('sftp-create-dir-success', { remotePath });
        });
      });
    });
  });

  return io;
}

module.exports = { initWebSSH };
