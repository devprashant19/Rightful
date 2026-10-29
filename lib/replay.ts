import voltlineReplay from "@/lib/replay/voltline.json";
import { NDJSONEvent } from "@/lib/types";

export async function* streamReplayEvents(): AsyncGenerator<NDJSONEvent> {
  const events = voltlineReplay as NDJSONEvent[];

  // Emitted with no artificial pacing. This generator is the last thing that
  // runs when live inference fails, and it previously awaited a setTimeout
  // between every event purely for cosmetic "realistic" pacing. A deployed run
  // emitted the degradation notice and then hung for 130s without ever sending
  // a terminal event, because timers do not reliably fire in this serverless
  // streaming context -- so the pacing that was meant to look good was the
  // thing preventing the run from ever finishing. The fallback must not depend
  // on a timer to complete.
  for (const event of events) {
    yield event;
  }
}

