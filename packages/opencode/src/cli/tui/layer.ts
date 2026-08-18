import { run as runTui, type TuiInput } from "@mrcodetol/tui"
import { Global } from "@mrcodetol/core/global"
import { AppNodeBuilder } from "@mrcodetol/core/effect/app-node-builder"
import { Effect } from "effect"

export function run(input: TuiInput) {
  return runTui(input).pipe(Effect.provide(AppNodeBuilder.build(Global.node)))
}
