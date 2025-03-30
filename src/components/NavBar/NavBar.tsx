import { Button } from "@/components/ui/button"

interface NavBarProps {
  isTempEnabled: boolean
  isPrecEnabled: boolean
  onTempClicked: (value: boolean) => void
  onPrecClicked: (value: boolean) => void
}

export const NavBar = ({
  isTempEnabled,
  isPrecEnabled,
  onTempClicked,
  onPrecClicked,
}: NavBarProps) => {
  return (
    <nav className="flex flex-col gap-2">
      <Button
        variant="outline"
        className={
          isTempEnabled
            ? "cursor-pointer bg-red-400 hover:bg-red-300"
            : "cursor-pointer hover:bg-red-300"
        }
        onClick={() => onTempClicked(!isTempEnabled)}
      >
        Temperature
      </Button>
      <Button
        variant="outline"
        className={
          isPrecEnabled
            ? "cursor-pointer bg-blue-400 hover:bg-blue-300"
            : "cursor-pointer hover:bg-blue-300"
        }
        onClick={() => onPrecClicked(!isPrecEnabled)}
      >
        Precipitations
      </Button>
    </nav>
  )
}
