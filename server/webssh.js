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
          readyTimeout: 20000,
          keepaliveInterval: 10000,
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
  });

  return io;
}

module.exports = { initWebSSH };
