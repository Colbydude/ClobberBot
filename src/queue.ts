type Task<T> = () => Promise<T>;

class Queue<T> {
    private tasks: Task<T>[] = [];
    private isProcessing: boolean = false;

    /**
     * Add a task to the queue.
     */
    enqueue(task: Task<T>): void {
        this.tasks.push(task);
        this.process();
    }

    /**
     * Process the tasks in the queue.
     */
    private async process(): Promise<void> {
        if (this.isProcessing || this.tasks.length === 0) {
            return;
        }

        this.isProcessing = true;

        // Process each task in the queue
        while (this.tasks.length > 0) {
            const task = this.tasks.shift();
            if (task) {
                try {
                    await task();
                } catch (error) {
                    console.error('Task failed:', error);
                }
            }
        }

        this.isProcessing = false;
    }
}

export default Queue;
