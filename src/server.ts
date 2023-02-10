import { logger } from './libs';
import { setupApp, env, wsConnect, handleMessages, wsClose } from './config'

const { port } = env

wsConnect().then(() => {
    logger.info('Websocket connected');

    handleMessages();
    
    const app = setupApp()
    
    app.listen(port, () => {
        logger.info(`Server running at http://localhost:${port}`)
    });
});

process.on('exit', () => {
    wsClose();
})