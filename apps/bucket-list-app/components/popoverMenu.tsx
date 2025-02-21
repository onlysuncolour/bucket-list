import { View } from 'react-native';
// import { Popover, YStack, Button, Adapt } from 'tamagui';
import { Button, H4, Popover, XStack, YStack, isWeb } from 'tamagui'


interface PopoverMenuProps {
  triggerNode: React.ReactNode;
  menus: Array<{
    title: string;
    action: () => void;
  }>;
}

export function PopoverMenu({ triggerNode, menus }: PopoverMenuProps) {
  return (
    <Popover placement="bottom" offset={8}>
      <Popover.Trigger asChild>
        <Button>{triggerNode}</Button>
      </Popover.Trigger>

      {/* <Adapt when="sm" platform="touch">
        <Popover.Sheet animation="medium" modal dismissOnSnapToBottom>
          <Popover.Sheet.Frame padding="$4">
            <Adapt.Contents />
          </Popover.Sheet.Frame>
          <Popover.Sheet.Overlay
            backgroundColor="$shadowColor"
            animation="lazy"
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
        </Popover.Sheet>
      </Adapt> */}

      <Popover.Content
        borderWidth={1}
        borderColor="$borderColor"
        enterStyle={{ y: 0, opacity: 0 }}
        exitStyle={{ y: 0, opacity: 0 }}
        height={menus.length * 40}
        opacity={1}
        animation={[
          'quick',
          {
            opacity: {
              overshootClamping: true,
            },
          },
        ]}
        elevate
        >
        <Popover.Arrow borderWidth={1} borderColor="$borderColor" />

        <YStack space="$1">
          {menus.map((menu, index) => (
            <Button
              key={index}
              size="$2"
              onPress={() => {
                menu.action();
              }}>
              {menu.title}
            </Button>
          ))}
        </YStack>
      </Popover.Content>
    </Popover>
  );
}