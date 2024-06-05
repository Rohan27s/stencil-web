/// <reference types="react" />
import type { StoryObj } from '@storybook/react';
declare const meta: {
    title: string;
    component: import("react").FC<{}>;
    tags: string[];
    parameters: {
        layout: string;
    };
    decorators: ((Story: import("@storybook/types").PartialStoryFn<import("@storybook/react/dist/types-bf5e6555").R, {}>) => import("react/jsx-runtime").JSX.Element)[];
    args: {
        config: {
            component: {
                title: string;
                description: string;
                backText: string;
            };
        };
    };
};
export default meta;
type Story = StoryObj<typeof meta>;
export declare const ComingSoon: Story;