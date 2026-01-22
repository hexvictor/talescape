import type { Expand } from "../../../../types/utils";

export type FragmentType = Expand<keyof FragmentDataMap>;

export type FragmentData = FragmentDataMap[keyof FragmentDataMap];

export type TextFragmentData = {
  content: string;
};

export type ImageFragmentData = {
  url: string;
  alt?: string;
};

export type AudioFragmentData = {
  url: string;
  duration?: number;
};

export type VideoFragmentData = {
  url: string;
  thumbnail?: string;
  duration?: number;
};

export type FragmentDataMap = {
  text: TextFragmentData;
  image: ImageFragmentData;
  audio: AudioFragmentData;
  video: VideoFragmentData;
};
