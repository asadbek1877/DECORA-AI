import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/cloudinary.service';
import { BadRequestError, NotFoundError } from '../utils/errors';

export const getTrialDemos = async (req: Request, res: Response) => {
const demos = await prisma.trialDemo.findMany({
where: { isActive: true },
orderBy: { order: 'asc' },
take: 5,
include: { variants: true }
});
res.status(200).json({ success: true, demos });
};

// Admin endpoints
export const createTrialDemo = async (req: Request, res: Response) => {
const { title, order } = req.body;
if (!req.file) throw new BadRequestError('Image file is required');

const uploadResult = await uploadToCloudinary(req.file.path, 'trial_demos');

const demo = await prisma.trialDemo.create({
data: {
title: title || 'Demo Image',
beforeImageUrl: uploadResult.url,
beforePublicId: uploadResult.publicId,
order: parseInt(order as string) || 0
},
include: { variants: true }
});

res.status(201).json({ success: true, demo });
};

export const deleteTrialDemo = async (req: Request, res: Response) => {
const id = req.params.id as string;
const demo = await prisma.trialDemo.findUnique({
where: { id },
include: { variants: true }
});
if (!demo) throw new NotFoundError('Demo not found');

if (demo.beforePublicId) {
await deleteFromCloudinary(demo.beforePublicId);
}
for (const variant of demo.variants) {
if (variant.afterPublicId) {
await deleteFromCloudinary(variant.afterPublicId);
}
}

await prisma.trialDemo.delete({ where: { id } });
res.status(200).json({ success: true, message: 'Deleted successfully' });
};

export const addTrialDemoVariant = async (req: Request, res: Response) => {
const id = req.params.id as string;
const { styleName } = req.body;
if (!req.file) throw new BadRequestError('Image file is required');
if (!styleName) throw new BadRequestError('Style name is required');

const trialDemo = await prisma.trialDemo.findUnique({ where: { id } });
if (!trialDemo) throw new NotFoundError('Trial demo not found');

const uploadResult = await uploadToCloudinary(req.file.path, 'trial_variants');

const variant = await prisma.trialDemoVariant.create({
data: {
trialDemoId: id,
styleName: styleName as string,
afterImageUrl: uploadResult.url,
afterPublicId: uploadResult.publicId
}
});

res.status(201).json({ success: true, variant });
};

export const deleteTrialDemoVariant = async (req: Request, res: Response) => {
const variantId = req.params.variantId as string;
const variant = await prisma.trialDemoVariant.findUnique({ where: { id: variantId } });
if (!variant) throw new NotFoundError('Variant not found');

if (variant.afterPublicId) {
await deleteFromCloudinary(variant.afterPublicId);
}

await prisma.trialDemoVariant.delete({ where: { id: variantId } });
res.status(200).json({ success: true, message: 'Variant deleted successfully' });
};

export const fetchAllTrialDemosAdmin = async (req: Request, res: Response) => {
const demos = await prisma.trialDemo.findMany({
orderBy: { order: 'asc' },
include: { variants: true }
});
res.status(200).json({ success: true, demos });
};

