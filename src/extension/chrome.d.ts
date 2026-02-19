declare namespace chrome {
  namespace runtime {
    const lastError: { message?: string } | undefined;
    function sendMessage(
      message: unknown,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      callback?: (response: any) => void
    ): void;
    function getManifest(): { version: string; [key: string]: unknown };
    function getURL(path: string): string;
    function requestUpdateCheck(callback: (status: string) => void): void;
    const onMessage: {
      addListener(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        callback: (message: any, sender: any, sendResponse: (response: any) => void) => boolean | void
      ): void;
    };
    const onInstalled: {
      addListener(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        callback: (details: any) => void
      ): void;
    };
  }

  namespace storage {
    namespace local {
      function get(keys: string | string[] | Record<string, unknown>): Promise<Record<string, unknown>>;
      function set(items: Record<string, unknown>): Promise<void>;
      function remove(keys: string | string[]): Promise<void>;
    }
  }

  namespace tabs {
    function create(createProperties: { url: string }): Promise<unknown>;
  }

  namespace notifications {
    function create(
      notificationId: string,
      options: {
        type: string;
        iconUrl: string;
        title: string;
        message: string;
        contextMessage?: string;
        requireInteraction?: boolean;
        buttons?: Array<{ title: string }>;
      }
    ): Promise<string>;
    function clear(notificationId: string): Promise<boolean>;
    const onButtonClicked: {
      addListener(callback: (notificationId: string, buttonIndex: number) => void): void;
    };
    const onClosed: {
      addListener(callback: (notificationId: string) => void): void;
    };
  }
}
