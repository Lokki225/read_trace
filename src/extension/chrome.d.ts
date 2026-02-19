declare namespace chrome {
  namespace runtime {
    const lastError: { message?: string } | undefined;
    function sendMessage(
      message: unknown,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      callback?: (response: any) => void
    ): void;
    const onMessage: {
      addListener(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        callback: (message: any, sender: any, sendResponse: (response: any) => void) => boolean | void
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
}
