import { ChevronUp } from '@tamagui/lucide-icons'
import { Toast, useToastController, useToastState } from '@tamagui/toast'
import { Button, H4, Popover, XStack, YStack, isWeb } from 'tamagui'

export function CurrentPopover() {

  return (
    <Popover size="$5" allowFlip stayInFrame offset={15} resize placement='top'>
      <Popover.Trigger asChild>
        <Button icon={ChevronUp} />
      </Popover.Trigger>

      <Popover.Content
        borderWidth={1}
        borderColor="$borderColor"
        width={300}
        height={300}
        enterStyle={{ y: -10, opacity: 0 }}
        exitStyle={{ y: -10, opacity: 0 }}
        elevate
        animation={[
          'quick',
          {
            opacity: {
              overshootClamping: true,
            },
          },
        ]}
      >
        <Popover.Arrow borderWidth={1} borderColor="$borderColor" />

        <YStack gap="$3">
          <XStack gap="$3">
            {/* <Label size="$3" htmlFor={Name}>
              Name
            </Label>
            <Input f={1} size="$3" id={Name} /> */}
          </XStack>

          <Popover.Close asChild>
            <Button
              size="$3"
              onPress={() => {
                /* Custom code goes here, does not interfere with popover closure */
              }}
            >
              Submit
            </Button>
          </Popover.Close>
        </YStack>
      </Popover.Content>
    </Popover>
  )
}

export function ToastControl() {
  const toast = useToastController()

  return (
    <YStack gap="$2" items="center">
      <H4>Toast demo</H4>
      <XStack gap="$2" justify="center">
        <Button
          onPress={() => {
            toast.show('Successfully saved!', {
              message: "Don't worry, we've got your data.",
            })
          }}
        >
          Show
        </Button>
        <Button
          onPress={() => {
            toast.hide()
          }}
        >
          Hide
        </Button>
      </XStack>
    </YStack>
  )
}
