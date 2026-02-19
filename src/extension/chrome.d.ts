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
}
