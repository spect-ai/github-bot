/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Probot} app
 */

const axios = require("axios");
const SmeeClient = require("smee-client");

const smee = new SmeeClient({
  source: process.env.WEBHOOK_PROXY_URL,
  target: "http://localhost:4000/events",
  logger: console,
});

const events = smee.start();
events.close();

module.exports = (app) => {
  app.log.info("Yay, the app has loaded!");
  app.on("pull_request.opened", opened);
  app.on("pull_request.reopened", opened);
  app.on("pull_request.closed", closed);

  let comment;

  async function opened(context) {
    const prhead = String(context.payload.pull_request.title).trim();
    const keywords = prhead.split(" ", 2);
    const essential = keywords[0];
    console.log({ prhead, keywords, essential });

    const name = String(context.payload.pull_request.user.login);
    const prLink = String(context.payload.pull_request.html_url);
    var matches = prhead.match(/\[(.*?)\]/);

    if (essential == "Spect" && matches) {
      var submatch = matches[1];
      const taskIds = submatch.split(",").map(function (item) {
        return item.trim();
      });
      var data = {
        updates: {
          status: 200,
        },
      };
      console.log({ taskIds });

      var config = {
        method: "get",
        url: `${
          process.env.DEV_ENV === "local"
            ? `https://pbsxrhv9x6qo.usemoralis.com:2053/server/functions/githubUpdateCard?_ApplicationId=cq3uoPVGZeNUgtREjNzcOIxMA132Xsx5IighR4nE&taskIds=${taskIds}&link=${prLink}&user=${name}`
            : `https://msc1tunwvyrc.usemoralis.com:2053/server/functions/githubUpdateCard?_ApplicationId=whJKcYaJTM9Mffe8FXop5wFPqvkBEksRRhlh1jMa&taskIds=${taskIds}&link=${prLink}&user=${name}`
        }`,
        data: data,
      };

      await axios(config)
        .then(function (response) {
          console.log(response.data);
          comment = "Hey " + name + ", " + `${response.data.result}`;
        })
        .catch(function (error) {
          console.log(error);
        });

      const issueComment = context.issue({
        body: comment,
      });
      return context.octokit.issues.createComment(issueComment);
    }
  }

  async function closed(context) {
    const mergeState = context.payload.pull_request.merged;
    const prhead = String(context.payload.pull_request.title).trim();
    const keywords = prhead.split(" ", 2);
    const essential = keywords[0];
    console.log({ prhead, keywords, essential });

    const prLink = String(context.payload.pull_request.html_url);
    const name = String(context.payload.pull_request.user.login);
    var matches = prhead.match(/\[(.*?)\]/);
    if (essential == "Spect" && mergeState == true && matches) {
      var submatch = matches[1];
      const taskIds = submatch.split(",").map(function (item) {
        return item.trim();
      });
      console.log({ taskIds, submatch });

      var data = {
        updates: {
          status: 205,
        },
      };

      var config = {
        method: "get",
        url: `${
          process.env.DEV_ENV === "local"
            ? `https://pbsxrhv9x6qo.usemoralis.com:2053/server/functions/githubUpdateCard?_ApplicationId=cq3uoPVGZeNUgtREjNzcOIxMA132Xsx5IighR4nE&taskIds=${taskIds}&link=${prLink}&user=${name}`
            : `https://msc1tunwvyrc.usemoralis.com:2053/server/functions/githubUpdateCard?_ApplicationId=whJKcYaJTM9Mffe8FXop5wFPqvkBEksRRhlh1jMa&taskIds=${taskIds}&link=${prLink}&user=${name}`
        }`,
        data: data,
      };

      await axios(config)
        .then(function (response) {
          console.log(response.data);
        })
        .catch(function (error) {
          console.log(error);
        });
    }
  }
};
