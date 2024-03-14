import io from 'socket.io-client';
const sockets = io('https://group-call-backend.onrender.com', { autoConnect: true, forceNew: true });
// const sockets = io('/');
export default sockets;
