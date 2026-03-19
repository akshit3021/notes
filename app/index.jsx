import { NotePencilIcon } from "phosphor-react-native";
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <NotePencilIcon size={32} weight="duotone" />
      <Text className="text-3xl">Notes</Text>
    </View>
  );
}
