import Controls from "./Controls";
import Turntable from "./Turntable";
import { VinylProvider } from "./VinylProvider";
import Waveform from "./Waveform";

import "./vinyl.css";

export default function VinylPlayer() {
    return <VinylProvider>
        <Turntable />
        <Waveform />
        <Controls />
    </VinylProvider>;
}