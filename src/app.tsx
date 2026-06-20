import {Map} from "./assets/components/Map.tsx";
import {ToastContainer} from "react-toastify";
import HelpPopover from "./assets/components/HelpPopover.tsx";


export function App() {
  return (<div className="h-dvh flex flex-col">
    <div className="flex flex-row p-2 w-full">
      <div className="flex flex-row justify-between w-full">
        <span className="text-lg font-bold">Drinking water explorer</span>
        <HelpPopover/>
      </div>
    </div>
    <div class="grow">
      <Map/>
      <ToastContainer/>
    </div>
  </div>)
}
