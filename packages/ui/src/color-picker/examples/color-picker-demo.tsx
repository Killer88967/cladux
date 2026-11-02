import {
  ColorPicker,
  ColorPickerAlpha,
  ColorPickerArea,
  ColorPickerEyeDropper,
  ColorPickerHue,
  ColorPickerInput,
} from "@cladux/ui";

export default function ColorPickerDemo() {
  return (
    <ColorPicker defaultValue="#6366f1" className="max-w-64">
      <ColorPickerArea />
      <ColorPickerHue />
      <ColorPickerAlpha />
      <div className="flex gap-2">
        <ColorPickerEyeDropper />
        <ColorPickerInput />
      </div>
    </ColorPicker>
  );
}
