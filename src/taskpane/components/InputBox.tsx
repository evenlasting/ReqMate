import React, { useState } from "react";
import {
  PrimaryButton,
  TextField,
  Stack,
  IStackTokens,
  ContextualMenu,
  IContextualMenuItem,
  Icon,
  Dialog,
  DialogType,
  DialogFooter,
  DefaultButton,
} from "@fluentui/react";

interface InputBoxProps {
  onSubmit: (prompt: string, apiKey: string) => void;
  submitting: boolean;
  errorInfo: string | null;
}

const stackTokens: IStackTokens = { childrenGap: 10 };

const menuItems: IContextualMenuItem[] = [
  { key: "1", text: "排版太丑了." },
  { key: "2", text: "颜色太暗了." },
  { key: "3", text: "和下一页缺少承接." },
];

export const InputBox: React.FC<InputBoxProps> = ({ onSubmit, submitting, errorInfo }) => {
  console.log(errorInfo)
  const [input, setInput] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [apiKey, setApiKey] = useState("");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(input, apiKey);
  };

  const handleItemClick = (item: IContextualMenuItem) => {
    setInput(item.text);
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDialog = () => {
    setDialogVisible(!dialogVisible);
  };

  const handleDialogSubmit = () => {
    toggleDialog();
  };

  return (
    <form onSubmit={handleSubmit}>
      <Stack tokens={stackTokens} styles={{ root: { padding: 10 } }}>
        <Stack.Item>
          <span>What kind of changes to the PowerPoint you would like to make?</span>
        </Stack.Item>
        <Stack tokens={stackTokens} horizontal verticalAlign="center" horizontalAlign="space-between">
          <Stack.Item align="start">
            <span role="button" onClick={toggleMenu} style={{ color: "#106EBE", cursor: "pointer" }}>
              {"Select a sample requirement ⏷"}
            </span>
            <span>, or ...</span>
          </Stack.Item>
          <Stack.Item align="end">
            <Icon iconName="Settings" onClick={toggleDialog} style={{ cursor: "pointer" }} />
          </Stack.Item>
        </Stack>
        <TextField
          value={input}
          onChange={(_, newValue) => setInput(newValue || "")}
          placeholder="input requirements"
        />
        {/* <b style={{ textAlign: "center", color: "red" }}>{errorInfo}</b> */}
        <Stack>
          <PrimaryButton type="submit" disabled={submitting}>
            {submitting ? "Loading... (it may take 20 seconds)" : "Submit"}
          </PrimaryButton>
        </Stack>
      </Stack>
      {isMenuOpen && (
        <ContextualMenu
          items={menuItems}
          onItemClick={(_, item) => handleItemClick(item)}
          onDismiss={() => setIsMenuOpen(false)}
        />
      )}
      <Dialog
        hidden={!dialogVisible}
        onDismiss={toggleDialog}
        dialogContentProps={{
          type: DialogType.normal,
          title: "Input OpenAI API Key",
          subText:
            "Your key will only be used locally. Alternatively, you can use the MS intranet to avoid the plugin's dependency on the key.",
        }}
        modalProps={{
          isBlocking: true,
          styles: { main: { maxWidth: 450 } },
        }}
      >
        <TextField label="API Key" value={apiKey} onChange={(_, newValue) => setApiKey(newValue || "")} />
        <DialogFooter>
          <PrimaryButton text="Submit" onClick={handleDialogSubmit} />
          <DefaultButton text="Cancel" onClick={toggleDialog} />
        </DialogFooter>
      </Dialog>
    </form>
  );
};
