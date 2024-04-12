self.addEventListener('message', (message) => {
    console.log('Start worker');
    console.log(message);
})