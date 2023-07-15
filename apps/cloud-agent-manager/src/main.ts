import { CloudAgentManager } from "@magickml/cloud-agent-manager"
import { PgNotifyReporter } from "@magickml/cloud-agent-manager"
import { initLogger, getLogger } from "@magickml/core"
import { app, BullQueue } from "@magickml/server-core"
import { DATABASE_URL } from "@magickml/config"

function start() {
    logger.info("Starting cloud agent manager...")
    const manager = new CloudAgentManager({
        mq: new BullQueue(),
        agentStateReporter: new PgNotifyReporter("agents", DATABASE_URL),
        pubSub: app.get('pubsub')
    });

    manager.run();
    logger.info("Cloud agent manager started")
}

initLogger({ name: "cloud-agent-manager" })
const logger = getLogger()
start()
