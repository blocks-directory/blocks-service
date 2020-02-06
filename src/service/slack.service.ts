import { WebClient } from '@slack/web-api'


export class SlackService {
  private readonly webClient

  constructor(token: string) {
    this.webClient = new WebClient(token)
  }

  public sendMessage = async (text: string, channel: string) => {
    const ts = Number(new Date())

    return this.webClient.chat.postMessage({
      ts,
      icon_emoji: ':fish:',
      channel,
      text,
    })
  }
}

export const slackService = new SlackService(process.env.slackToken!)
