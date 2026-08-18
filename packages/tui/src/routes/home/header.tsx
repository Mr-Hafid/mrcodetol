import { Logo } from "../../component/logo"
import { useTheme } from "../../context/theme"

const BYLINE = "by mrhafid"

export function HomeHeader() {
  const { theme } = useTheme()

  return (
    <box alignItems="flex-start" flexShrink={0}>
      <Logo />
      <text fg={theme.secondary}>{BYLINE}</text>
    </box>
  )
}
