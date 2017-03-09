import { BotExecutor } from "./BotExecutor";
import { Path } from "./Url";

const botDirectory: Path = new Path("/var/www/podbot/");
const pfcFile: Path = botDirectory.join("pfc.js");
const plushFile: Path = botDirectory.join("plush.js");
const pfc: BotExecutor = new BotExecutor(pfcFile, BotExecutor.colors.cyan);
pfc.configure();
const plush: BotExecutor = new BotExecutor(plushFile, BotExecutor.colors.green);
plush.configure();