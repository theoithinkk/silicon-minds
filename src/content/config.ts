import { defineCollection, z } from "astro:content";

const eras = defineCollection({
    type: "data",
    schema: z.object({
        id: z.string(),
        name: z.string(),
        period: z.string(),
        order: z.number().min(1).max(5),
        notableFeature: z.string(),
        description: z.string(),
        accentColor: z.string(),
    }),
});

const processors = defineCollection({
    type: "data",
    schema: z.array(
        z.object({
            id: z.string(),
            name: z.string(),
            eraId: z.string(),
            cores: z.number(),
            coreConfig: z.string(),
            clockSpeedGHz: z.number(),
            dieSizeMm2: z.number(),
            transistorCount: z.string(),
            processNodeNm: z.number(),
            notableFeature: z.string(),
            reference: z
                .object({
                    source: z.string(),
                    url: z.string().url(),
                })
                .optional(),
        }),
    ),
});

const quiz = defineCollection({
    type: "data",
    schema: z.object({
        questions: z.array(
            z.object({
                id: z.string(),
                eraId: z.string(),
                question: z.string(),
                options: z.tuple([
                    z.string(),
                    z.string(),
                    z.string(),
                    z.string(),
                ]),
                correctIndex: z.number().min(0).max(3),
                explanation: z.string(),
            }),
        ),
    }),
});

export const collections = { eras, processors, quiz };
