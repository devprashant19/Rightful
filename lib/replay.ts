import voltlineReplay from "@/lib/replay/voltline.json";
import { NDJSONEvent } from "@/lib/types";

export async function* streamReplayEvents(): AsyncGenerator<NDJSONEvent> {
  const events = voltlineReplay as NDJSONEvent[];

  for (const event of events) {
    // Realistic delay per step
    const delay = event.type === "step" && event.status === "done" ? 600 : 250;
    await new Promise((r) => setTimeout(r, delay));
    yield event;
  }
}

