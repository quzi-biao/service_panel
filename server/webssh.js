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
      console.log('SSH connection request:', { host: config.host, port: config.port, username: config.username });
      
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
        sshClient.connect({
          host: config.host,
          port: config.port || 22,
          username: config.username,
          password: config.password,
          readyTimeout: 20000,
          keepaliveInterval: 10000
        });
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
