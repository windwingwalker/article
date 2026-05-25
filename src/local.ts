import * as fs from "fs";
import { lambdaHandler } from "./index";
import { loadLocalEnv } from "./loadLocalEnv";

loadLocalEnv();

const readEvent = async (): Promise<any> => {
  const eventPath = process.argv[2];
  const input = eventPath != null
    ? fs.readFileSync(eventPath, "utf8")
    : await new Promise<string>((resolve, reject) => {
      var data = "";
      process.stdin.setEncoding("utf8");
      process.stdin.on("data", (chunk) => data += chunk);
      process.stdin.on("end", () => resolve(data));
      process.stdin.on("error", reject);
    });

  return JSON.parse(input);
};

if (require.main === module) {
  readEvent()
    .then((event) => lambdaHandler(event, {}))
    .then((response) => {
      console.log(JSON.stringify(response, null, 2));
    })
    .catch((err) => {
      console.error(err);
      process.exitCode = 1;
    });
}
