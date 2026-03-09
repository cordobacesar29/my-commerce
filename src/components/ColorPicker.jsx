import { useSnapshot } from 'valtio';
import { HexColorPicker } from 'react-colorful';

import state from '../store';

const ColorPicker = () => {
  const snap = useSnapshot(state);

  return (
    <div className="absolute left-full ml-3">
      <HexColorPicker 
        color={snap.color}
        onChange={(color) => state.color = color}
      />
      <div className="mt-2 flex gap-2">
        {["#ffffff", "#000000", "#808080", "#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#00ffff", "#ffa500"].map((preset) => (
          <button
            key={preset}
            className="w-6 h-6 rounded border border-gray-300"
            style={{ backgroundColor: preset }}
            onClick={() => state.color = preset}
          />
        ))}
      </div>
    </div>
  )
}

export default ColorPicker