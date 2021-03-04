import yaml from "yaml";
import fs from "fs";
import util from "util";
import {exec as execAsync} from "child_process";
const exec = util.promisify(execAsync);

const args = process.argv;
const repo = args[2];

const getFilesWithExtension = (path, ext) => {
  const items = fs.readdirSync(path)
      .filter(item => (
          !item.startsWith(".") &&
          !item.startsWith("_") &&
          (item.endsWith(`.${ext}`) || fs.lstatSync(`${path}/${item}`).isDirectory())
      ))
      .map(item => ({ name: item, isDir: fs.lstatSync(`${path}/${item}`).isDirectory() }));
  let files = [];
  for (const item of items) {
    if (item.isDir) {
      files = [...files, ...getFilesWithExtension(`${path}/${item.name}`, ext)];
    } else {
      files.push(`${path}/${item.name}`);
    }
  }
  return files;
}
const findKeyInObject = (obj, key) => {
  for (const [k, v] of Object.entries(obj)) {
    if (k === key) {
      return v;
    } else if (typeof v === 'object') {
      const deeper = findKeyInObject(v, key);
      if (deeper !== false) {
        return deeper;
      }
    }
  }
  return false;
}
const formatDate = date => {
  const dateString = date.toLocaleString("en-NZ", {timeZone: "Pacific/Auckland"});
  // Node on github actions only has US localization, so we need to swap day and month:
  const firstPart = dateString.split(",")[0];
  const pieces = firstPart.split("/");
  return `${pieces[1]}/${pieces[0]}/${pieces[2]},${dateString.split(',')[1]}`;
}

(async function () {
  const versionData = {};
  const now = new Date();
  const separator = "____\n";
  let versionOutput = "";

  process.chdir("../../../");
  // For each branch:
  const branches = ["prod", "test", "dev"];
  const releaseNotesLinks = {
    prod: "https://docs.cacophony.org.nz/home/release-notes-2020",
    dev: "https://docs.cacophony.org.nz/home/release-notes-2"
  };
  for (const branch of branches) {
    process.chdir(`./${branch}`);
    const slsFiles = getFilesWithExtension(".", "sls");
    versionData[branch] = {};
    for (const path of slsFiles) {
      const data = fs.readFileSync(path, "utf8");
      try {
        const yamlData = yaml.parse(data);
        const versionInfo = findKeyInObject(yamlData, "cacophony.pkg_installed_from_github");
        const name = versionInfo.find(item => item.hasOwnProperty("name")).name;
        const version = versionInfo.find(item => item.hasOwnProperty("version")).version;
        versionData[branch][name] = version;
      } catch (e) {
      }
    }
    process.chdir("../");
  }

  // Output the text to the README.md file, if the version info has changed since last time.
  for (const branch of branches) {
    versionOutput += `#### Branch \`${branch}\`\n`;
    for (const [key, val] of Object.entries(versionData[branch])) {
      versionOutput += ` * ${key}: ${val}\n`;
    }
    if (releaseNotesLinks[branch]) {
      versionOutput += `\n[Release notes](${releaseNotesLinks[branch]})\n`;
    }
  }

  // Just write out on the dev branch.
  const branch = "dev";
  let prevVersionOutput = "";
  process.chdir(`./${branch}`);
  const readme = fs.readFileSync("README.md", "utf8");
  const versionInfoStart = readme.indexOf("\n\n#### Version information");
  let output;
  if (versionInfoStart !== -1) {
    output = readme.substring(0, versionInfoStart);
    prevVersionOutput = readme.substring(readme.indexOf(separator) + separator.length);
  } else {
    output = readme;
  }
  output += "\n\n#### Version information ";
  output += `(_Updated ${formatDate(now)}_):\n`;
  output += separator;
  output += versionOutput;
  if (versionOutput !== prevVersionOutput) {
    fs.writeFileSync("README.md", output);
    if (repo === "TheCacophonyProject/saltops") {
      console.log("Committing changes for branch", branch);
      {
        const {stderr, stdout} = await exec("git config user.name cacophony-bot");
        console.log("1:", stderr, stdout);
      }
      {
        const {stderr, stdout} = await exec("git config user.email bot@cacophony.org.nz");
        console.log("2:", stderr, stdout);
      }
      {
        const {stderr, stdout} = await exec("git add .");
        console.log("3:", stderr, stdout);
      }
      {
        const {stderr, stdout} = await exec("git commit -m \"updated version information\"");
        console.log("4:", stderr, stdout);
      }
      {
        console.log("Pushing");
        const {stderr, stdout} = await exec("git push --force");
        console.log("5:", stderr, stdout);
      }
    }
  } else {
    // Version info is unchanged.
    console.log("version information unchanged");
  }
  process.chdir("../");

}());
