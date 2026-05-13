/**
 * test-ai.ts — Replicate + Cloudinary тест скрипти
 * 
 * Ишлатиш:
 *   cd backend
 *   npx ts-node src/test-ai.ts
 */

import dotenv from 'dotenv';
dotenv.config();

import Replicate from 'replicate';
import { v2 as cloudinary } from 'cloudinary';

// ─── Config ───────────────────────────────
const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN || process.env.REPLICATE_API || '';
const CLOUDINARY_CLOUD = process.env.CLOUDINARY_CLOUD_NAME || '';
const CLOUDINARY_KEY = process.env.CLOUDINARY_API_KEY || '';
const CLOUDINARY_SECRET = process.env.CLOUDINARY_API_SECRET || '';

// Тест расм — оддий хона фото (Unsplash)
const TEST_IMAGE_URL = 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80';

const TEST_PROMPT = 'Professional interior design photo of a living room redesigned in Modern Minimalism style. Clean lines, white walls, light wood furniture, natural light, photorealistic, 4K quality, architectural visualization.';

console.log('═══════════════════════════════════════════════');
console.log('  AI INTERIOR DESIGNER — TEST SCRIPT');
console.log('═══════════════════════════════════════════════\n');

// ─── 1. Текшириш: API калитлар мавжудми? ──
async function checkConfig() {
  console.log('📋 STEP 1: Checking configuration...\n');
  
  const checks = [
    { name: 'REPLICATE_API_TOKEN', value: REPLICATE_TOKEN, masked: REPLICATE_TOKEN ? `${REPLICATE_TOKEN.substring(0, 8)}...${REPLICATE_TOKEN.slice(-4)}` : 'NOT SET' },
    { name: 'CLOUDINARY_CLOUD_NAME', value: CLOUDINARY_CLOUD, masked: CLOUDINARY_CLOUD || 'NOT SET' },
    { name: 'CLOUDINARY_API_KEY', value: CLOUDINARY_KEY, masked: CLOUDINARY_KEY ? `${CLOUDINARY_KEY.substring(0, 6)}...` : 'NOT SET' },
    { name: 'CLOUDINARY_API_SECRET', value: CLOUDINARY_SECRET, masked: CLOUDINARY_SECRET ? `${CLOUDINARY_SECRET.substring(0, 6)}...` : 'NOT SET' },
  ];

  let allOk = true;
  for (const check of checks) {
    const status = check.value ? '✅' : '❌';
    console.log(`  ${status} ${check.name}: ${check.masked}`);
    if (!check.value) allOk = false;
  }

  if (!allOk) {
    console.log('\n❌ ОШИБКА: Не все API ключи настроены! Проверьте .env файл.');
    process.exit(1);
  }
  console.log('\n  ✅ All API keys present.\n');
}

// ─── 2. Cloudinary тест ───────────────────
async function testCloudinary() {
  console.log('📋 STEP 2: Testing Cloudinary...\n');

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD,
    api_key: CLOUDINARY_KEY,
    api_secret: CLOUDINARY_SECRET,
    secure: true,
  });

  try {
    // URL орқали расм юклаш
    console.log(`  ⏳ Uploading test image to Cloudinary...`);
    console.log(`  📸 Source: ${TEST_IMAGE_URL.substring(0, 60)}...`);
    
    const result = await cloudinary.uploader.upload(TEST_IMAGE_URL, {
      folder: 'ai-interior/test',
      resource_type: 'image',
    });

    console.log(`  ✅ Cloudinary upload SUCCESS!`);
    console.log(`  📦 Public ID: ${result.public_id}`);
    console.log(`  🔗 URL: ${result.secure_url}`);
    console.log(`  📐 Size: ${result.width}x${result.height}, ${result.bytes} bytes`);
    console.log(`  📄 Format: ${result.format}\n`);

    // Тозалаш
    await cloudinary.uploader.destroy(result.public_id);
    console.log(`  🗑️  Test image cleaned up from Cloudinary.\n`);

    return result.secure_url;
  } catch (error: any) {
    console.error(`  ❌ Cloudinary FAILED!`);
    console.error(`  Error name: ${error.name}`);
    console.error(`  Error message: ${error.message}`);
    console.error(`  HTTP status: ${error.http_code || 'N/A'}`);
    console.error(`  Full error:`, error);
    return null;
  }
}

// ─── 3. Replicate модел тест ──────────────
async function testReplicateModel(name: string, modelId: string, input: Record<string, any>) {
  console.log(`  ⏳ Testing model: ${name}`);
  console.log(`     Model ID: ${modelId}`);

  const replicate = new Replicate({ auth: REPLICATE_TOKEN });

  try {
    const startTime = Date.now();
    const output = await replicate.run(modelId as `${string}/${string}:${string}`, { input });
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log(`  📦 Raw output type: ${typeof output}, isArray: ${Array.isArray(output)}`);
    
    if (output && typeof output === 'object') {
      console.log(`  📦 Constructor: ${output.constructor?.name}`);
      console.log(`  📦 Keys: ${JSON.stringify(Object.keys(output))}`);
    }

    // URL олиш
    let resultUrl: string | null = null;

    if (Array.isArray(output) && output.length > 0) {
      const first = output[0];
      if (typeof first === 'string') {
        resultUrl = first;
      } else if (first && typeof first === 'object') {
        console.log(`  📦 First element type: ${typeof first}, constructor: ${first.constructor?.name}`);
        console.log(`  📦 First element keys: ${JSON.stringify(Object.keys(first))}`);
        if ('url' in first) {
          const urlVal = typeof first.url === 'function' ? first.url() : first.url;
          resultUrl = urlVal;
        } else {
          resultUrl = first.toString();
        }
      }
    } else if (typeof output === 'string') {
      resultUrl = output;
    } else if (output && typeof output === 'object') {
      if ('url' in (output as any)) {
        const urlVal = typeof (output as any).url === 'function' ? (output as any).url() : (output as any).url;
        resultUrl = urlVal;
      }
      console.log(`  📦 Output as string: ${String(output).substring(0, 200)}`);
    }

    if (resultUrl) {
      console.log(`  ✅ ${name} SUCCESS! (${elapsed}s)`);
      console.log(`  🔗 Result URL: ${String(resultUrl).substring(0, 120)}...`);
    } else {
      console.log(`  ⚠️  ${name} returned output but no URL extracted. Raw:`, JSON.stringify(output).substring(0, 300));
    }

    return { success: true, url: resultUrl, elapsed };
  } catch (error: any) {
    console.error(`  ❌ ${name} FAILED!`);
    console.error(`     Error name: ${error.name}`);
    console.error(`     Error message: ${error.message}`);
    console.error(`     Status: ${error.status || error.statusCode || 'N/A'}`);
    if (error.response) {
      console.error(`     Response status: ${error.response.status}`);
      console.error(`     Response data:`, JSON.stringify(error.response.data || '').substring(0, 500));
    }
    return { success: false, url: null, error: error.message };
  }
}

async function testReplicate() {
  console.log('📋 STEP 3: Testing Replicate AI models...\n');

  // Модел 1: SDXL
  console.log('─── Model 1: SDXL ───');
  const sdxlResult = await testReplicateModel(
    'SDXL (stability-ai/sdxl)',
    'stability-ai/sdxl:7762fd07cf82c948538e41f63f77d685e02b063e37e496e96eefd46c929f9bdc',
    {
      image: TEST_IMAGE_URL,
      prompt: TEST_PROMPT,
      negative_prompt: 'ugly, blurry, low quality, text, watermark',
      num_outputs: 1,
      guidance_scale: 7.5,
      prompt_strength: 0.6,
      num_inference_steps: 25,
      scheduler: 'K_EULER_ANCESTRAL',
    }
  );
  console.log('');

  // Модел 2: SD 1.5 img2img
  console.log('─── Model 2: SD 1.5 img2img ───');
  const sd15Result = await testReplicateModel(
    'SD 1.5 img2img',
    'stability-ai/stable-diffusion-img2img:15a3689ee13b0d2616e98820eca31d4c3abcd36672df6afce5cb6f6b0c7b98c4',
    {
      image: TEST_IMAGE_URL,
      prompt: TEST_PROMPT,
      negative_prompt: 'ugly, blurry, low quality, text, watermark',
      num_outputs: 1,
      guidance_scale: 7.5,
      prompt_strength: 0.6,
      num_inference_steps: 25,
      scheduler: 'K_EULER_ANCESTRAL',
    }
  );
  console.log('');

  // Модел 3: ControlNet Canny
  console.log('─── Model 3: ControlNet Canny ───');
  const cnResult = await testReplicateModel(
    'ControlNet Canny',
    'jagilley/controlnet-canny:aff48af9c68d162388d230a2ab003f68d2638d88307bdaf1c2f1ac95079c9613',
    {
      image: TEST_IMAGE_URL,
      prompt: TEST_PROMPT,
      negative_prompt: 'ugly, blurry, low quality, text, watermark',
      num_samples: '1',
      image_resolution: '512',
      ddim_steps: 20,
      scale: 9,
      a_prompt: 'best quality, photorealistic, interior design',
    }
  );
  console.log('');

  // Хулоса
  console.log('═══════════════════════════════════════════════');
  console.log('  RESULTS SUMMARY');
  console.log('═══════════════════════════════════════════════');
  console.log(`  SDXL:            ${sdxlResult.success ? '✅ WORKS' : '❌ FAILED — ' + sdxlResult.error}`);
  console.log(`  SD 1.5 img2img:  ${sd15Result.success ? '✅ WORKS' : '❌ FAILED — ' + sd15Result.error}`);
  console.log(`  ControlNet:      ${cnResult.success ? '✅ WORKS' : '❌ FAILED — ' + cnResult.error}`);
  console.log('');

  return { sdxlResult, sd15Result, cnResult };
}

// ─── MAIN ─────────────────────────────────
async function main() {
  try {
    await checkConfig();
    const cloudinaryUrl = await testCloudinary();
    
    if (!cloudinaryUrl) {
      console.log('⚠️  Cloudinary failed, but continuing with Replicate test using direct URL...\n');
    }

    await testReplicate();

    console.log('\n🏁 Test complete!\n');
  } catch (error) {
    console.error('\n💥 UNEXPECTED ERROR:', error);
    process.exit(1);
  }
}

main();
