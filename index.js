const childProcess = require("child_process").execSync;
const fetch = require("node-fetch");

const getAllUserReposCloneUrls = async (username, attempt = 1) => {
  if (!username) throw new Error("Username is required");

  const MAX_ATTEMPTS = 3;
  const BASE_GITHUB_API_URL = "https://api.github.com";

  const gitHubUser = username;
  const gitHubUserReposUrl = `${BASE_GITHUB_API_URL}/users/${gitHubUser}/repos`;

  const response = await fetch(gitHubUserReposUrl);
  if (response.ok) {
    const parsedResponse = await response.json();
    const allUserReposData = parsedResponse;
    const userReposCloneUrls = allUserReposData.map((repo) => repo.clone_url);
    return userReposCloneUrls;
  }

  if (attempt < MAX_ATTEMPTS)
    return getAllUserReposCloneUrls(username, attempt++);

  throw new Error(
    `Max attempts exceeded. Failed to get user repos clone urls for ${gitHubUser}`
  );
};

const prepareDirForCloningProcess = async (targetDir) => {
  if (!targetDir) throw new Error("Target directory is required");

  console.log("Preparing directory for cloning...");
  try {
    childProcess(`cd ${targetDir} && rm -rf *`);
  } catch (e) {
    console.log(`${targetDir} does not exist. Creating it...`);
    childProcess(`mkdir ${targetDir}`);
  }
};

const cloneRepositories = async (reposCloneUrls, targetDir) => {
  if (!reposCloneUrls.length) throw new Error("Repos is required");
  if (!targetDir) throw new Error("Target directory is required");

  console.log("Cloning repositories...");
  const cloneCommands = reposCloneUrls.map(
    (repoCloneUrl) => `git clone ${repoCloneUrl}`
  );
  const cloneCommandsString = cloneCommands.join(" && ");
  childProcess(`cd ${targetDir} && ${cloneCommandsString}`);
};

const main = async () => {
  const USERNAME = "larafe1";
  const TARGET_DIR = "www";

  try {
    const allUserReposCloneUrls = await getAllUserReposCloneUrls(USERNAME);
    await prepareDirForCloningProcess(TARGET_DIR);
    await cloneRepositories(allUserReposCloneUrls, TARGET_DIR);
    console.log("Process terminated successfully");
  } catch (e) {
    console.log(e);
  }
};

main();
