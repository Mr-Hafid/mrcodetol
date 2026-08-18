import { TextAttributes } from "@opentui/core"
import { For, type JSX } from "solid-js"
import { useTerminalDimensions } from "@opentui/solid"
import { tint, useTheme } from "../context/theme"
import { logo, wordmark } from "../logo"

// Horizontal room the large wordmark needs once the home padding is accounted for.
export const WORDMARK_MIN_WIDTH = (wordmark[0]?.length ?? 0) + 8

export function Logo() {
  const { theme } = useTheme()
  const dimensions = useTerminalDimensions()
  // The compact font packs two vertical pixels per row via ▀ ▄, so it keeps the
  // shadow marks; the large wordmark is plain full blocks.
  const compact = logo.left.map((line, index) => line + " " + logo.right[index])
  const lines = () => (dimensions().width >= WORDMARK_MIN_WIDTH ? wordmark : compact)

  // Diagonal ramp: top-left starts at primary, bottom-right lands on secondary.
  const ramp = (column: number, row: number) => {
    const rows = lines()
    const width = Math.max(1, (rows[0]?.length ?? 1) - 1)
    const height = Math.max(1, rows.length - 1)
    return tint(theme.primary, theme.secondary, (column / width + row / height) / 2)
  }

  const renderLine = (line: string, row: number): JSX.Element[] =>
    Array.from(line).map((char, column) => {
      const fg = ramp(column, row)
      const shadow = tint(theme.background, fg, 0.3)
      if (char === "_") {
        return (
          <text fg={fg} bg={shadow} attributes={TextAttributes.BOLD} selectable={false}>
            {" "}
          </text>
        )
      }
      if (char === "^") {
        return (
          <text fg={fg} bg={shadow} attributes={TextAttributes.BOLD} selectable={false}>
            ▀
          </text>
        )
      }
      if (char === "~") {
        return (
          <text fg={shadow} attributes={TextAttributes.BOLD} selectable={false}>
            ▀
          </text>
        )
      }
      if (char === ",") {
        return (
          <text fg={shadow} attributes={TextAttributes.BOLD} selectable={false}>
            ▄
          </text>
        )
      }
      return (
        <text fg={fg} attributes={TextAttributes.BOLD} selectable={false}>
          {char}
        </text>
      )
    })

  return (
    <box>
      <For each={lines()}>{(line, index) => <box flexDirection="row">{renderLine(line, index())}</box>}</For>
    </box>
  )
}
