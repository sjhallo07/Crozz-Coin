// Modal Component with Information and Recommendations
import { Box, Button, Flex, Heading, Text, Dialog, ScrollArea } from "@radix-ui/themes";
import { ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: "small" | "medium" | "large";
  showClose?: boolean;
}

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  size = "medium",
  showClose = true,
}: ModalProps) {
  const sizeStyles = {
    small: { maxWidth: "400px" },
    medium: { maxWidth: "600px" },
    large: { maxWidth: "900px" },
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content style={sizeStyles[size]}>
        <Flex justify="between" align="center" gap="4">
          <Flex direction="column" gap="1" style={{ flex: 1 }}>
            <Dialog.Title>
              <Heading size="5">{title}</Heading>
            </Dialog.Title>
            {description && (
              <Dialog.Description>
                <Text size="2" color="gray">
                  {description}
                </Text>
              </Dialog.Description>
            )}
          </Flex>
          {showClose && (
            <Dialog.Close>
              <Button
                variant="ghost"
                size="1"
                style={{ cursor: "pointer" }}
                aria-label="Close"
              >
                <X size={16} />
              </Button>
            </Dialog.Close>
          )}
        </Flex>

        <ScrollArea style={{ height: "auto", maxHeight: "60vh" }}>
          <Box px="2" py="4">
            {children}
          </Box>
        </ScrollArea>
      </Dialog.Content>
    </Dialog.Root>
  );
}
