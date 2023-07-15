import BullMQ, { Queue } from 'bullmq'
import pino from 'pino'
import { getLogger } from '@magickml/core'
import { bullMQConnection } from '@magickml/config'

import { MessageQueue } from '../MessageQueues'
import { AgentJob } from '@magickml/agents'

export class BullQueue implements MessageQueue {
    logger: pino.Logger = getLogger()
    queue: Queue

    initialize(queueName: string): void {
        this.queue = new Queue(queueName, {
            connection: bullMQConnection
        })
    }

    async addJob(jobName: string, job: AgentJob, jobId?: string) {
        this.logger.info(`Adding job ${jobName} to queue ${this.queue.name}...`)
        await this.queue.add(jobName, job, { jobId })
        this.logger.info(`Added job ${jobName} to queue ${this.queue.name}`)
    }
}
