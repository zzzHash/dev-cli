export function minToMs(min: number): number {
  return min * 1000;
}

export async function delay(time: number): Promise<void> {
  return await new Promise((resolve) => setTimeout(resolve, time));
}
