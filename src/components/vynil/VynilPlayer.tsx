import Controls from "./Controls";
import Turntable from "./Turntable";
import { VynilProvider } from "./VynilProvider";
import Waveform from "./Waveform";

import "./vynil.css";

export default function VynilPlayer() {
    return <VynilProvider>
        <Turntable />
        <Waveform />
        <Controls />
    </VynilProvider>;
}