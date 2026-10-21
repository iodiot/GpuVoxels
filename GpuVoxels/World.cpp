#include "StdAfx.h"
#include "World.h"

World::World()
{
	voxels = new uint[size * size * size];
	baseVoxels = new uint[size * size * size];

	memset(voxels, 0, size * size * size * sizeof(uint));
	memset(baseVoxels, 0, size * size * size * sizeof(uint));
}

void World::SetVoxel(int x, int y, int z, uint value)
{
	if (x < 0 || x >= size || y < 0 || y >= size || z < 0 || z >= size)
		return;

	voxels[(x + z * size) + y * size * size] = value;
}

uint World::GetVoxel(int x, int y, int z)
{
	if (x < 0 || x >= size || y < 0 || y >= size || z < 0 || z >= size)
		return 0;
	else
		return voxels[(x + z * size) + y * size * size];
}

World::~World()
{
	delete[] voxels;
	delete[] baseVoxels;
}

void World::GenerateSomeGeometry()
{
	memset(voxels, 0, size * size * size * sizeof(uint));

	// The GPU reads the volume as RGBA8. Pack colors in byte order so the
	// terrain is the same on every launch and the scene is easy to reproduce.
	const uint grass = 0xff42a84c;
	const uint leafCopper = 0xff458ae5;
	const uint leafGold = 0xff5ac4e8;
	const uint soil = 0xff775241;
	const uint rock = 0xff66717e;
	const uint water = 0xffe06b2b;

	for (int x = 0; x < size; ++x)
		for (int z = 0; z < size; ++z)
		{
			float ridge = 2.7f * sin(x * 0.19f) + 2.2f * cos(z * 0.16f)
				+ 1.6f * sin((x + z) * 0.11f);
			float river = 31.0f + 7.0f * sin(z * 0.12f);
			float riverDistance = float(x) - river;
			int height = 12 + int(ridge);
			if (abs(riverDistance) < 5.0f)
				height -= 4 - int(abs(riverDistance) * 0.45f);
			height = max(5, min(height, 22));

			for (int y = 0; y <= height; ++y)
			{
				uint color = y == height ? grass : (y > height - 3 ? soil : rock);
				SetVoxel(x, y, z, color);
			}

			// A stepped blue river makes the height field read clearly from above.
			if (abs(riverDistance) < 2.0f)
				for (int y = height + 1; y <= height + 2; ++y)
					SetVoxel(x, y, z, water);

			if (abs(riverDistance) > 7.0f && height > 10
				&& ((x * 17 + z * 31 + x * z) % 97) < 3)
			{
				int trunkHeight = 3 + ((x + z) % 3);
				for (int y = height + 1; y <= height + trunkHeight; ++y)
					SetVoxel(x, y, z, 0xff61462e);

				int crownY = height + trunkHeight;
				for (int dx = -2; dx <= 2; ++dx)
					for (int dz = -2; dz <= 2; ++dz)
						for (int dy = -1; dy <= 2; ++dy)
							if (abs(dx) + abs(dz) + abs(dy) <= 4)
								SetVoxel(x + dx, crownY + dy, z + dz,
									((x + z) % 2) ? leafCopper : leafGold);
			}
		}


	memcpy(baseVoxels, voxels, size * size * size * sizeof(uint));
}

void World::UpdateSomeGeometry(int ticks)
{
	// Restore the static scene so the moving orb never erases terrain.
	memcpy(voxels, baseVoxels, size * size * size * sizeof(uint));
	const int radius = 4;
	const float phase = ticks * 0.035f;
	vec3 c(31.0f + 19.0f * cos(phase), 35.0f + 1.5f * sin(phase * 2.0f),
		31.0f + 15.0f * sin(phase));

	for (int x = int(c.x) - radius; x <= int(c.x) + radius; ++x)
		for (int y = int(c.y) - radius; y <= int(c.y) + radius; ++y)
			for (int z = int(c.z) - radius; z <= int(c.z) + radius; ++z)
				if (glm::length(c - vec3(x, y, z)) <= radius)
					SetVoxel(x, y, z, 0xff35c8ff);
}

void World::CopyIntoVolumeTexture(GLuint tex)
{
	glEnable(GL_TEXTURE_3D);
	glBindTexture(GL_TEXTURE_3D, tex);
	glTexSubImage3D(GL_TEXTURE_3D, 0, 0, 0, 0, size, size, size, GL_RGBA, GL_UNSIGNED_BYTE, voxels);
}
