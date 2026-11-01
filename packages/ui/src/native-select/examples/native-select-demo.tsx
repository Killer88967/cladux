import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from "@cladux/ui";

export default function NativeSelectDemo() {
  return (
    <NativeSelect className="w-48" aria-label="Fruit" defaultValue="">
      <NativeSelectOption value="">Select a fruit</NativeSelectOption>
      <NativeSelectOptGroup label="Fruits">
        <NativeSelectOption value="apple">Apple</NativeSelectOption>
        <NativeSelectOption value="banana">Banana</NativeSelectOption>
        <NativeSelectOption value="blueberry">Blueberry</NativeSelectOption>
        <NativeSelectOption value="grapes">Grapes</NativeSelectOption>
        <NativeSelectOption value="pineapple">Pineapple</NativeSelectOption>
      </NativeSelectOptGroup>
    </NativeSelect>
  );
}
