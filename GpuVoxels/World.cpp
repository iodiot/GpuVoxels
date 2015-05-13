#include "StdAfx.h"
#include "World.h"

World::World()
{
	voxels = new uint[size * size * size];

	memset(voxels, 0, size * size * size * sizeof(uint));

	center = vec3(32, 32, 10);
	srand(time(0));
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
}

void World::GenerateSomeGeometry()
{
	memset(voxels, 0, size * size * size * sizeof(uint));

	// Ground plane
	for (int x = 0; x < size; ++x)
		for (int z = 0; z < size; ++z)
		{
			int h = int(5.0f * sin(x * 0.1f) * cos(z * 0.1f));
			SetVoxel(x, z, h, 0x0000ff00);
			if (h > 0 && rand() % 50 == 0)
				SetVoxel(x, z, h + 1, 0xff);
		}
}

void World::UpdateSomeGeometry(int ticks)
{
	int radius = 5;
	vec3 c = center;
	float eps = 0.0001f;

	c.x = 10.0f * sin(center.x * float((ticks - 1) * eps)) + center.x;
	c.y = 10.0f * cos(center.y * float((ticks - 1) * eps)) + center.y;

	for (int x = c.x - radius; x < c.x + radius; ++x)
		for (int y = c.y - radius; y < c.y + radius; ++y)
			for (int z = c.z - radius; z < c.z + radius; ++z)
				if (glm::length(c - vec3(x, y, z)) < radius)
					SetVoxel(x, y, z, 0);

	c.x = 10.0f * sin(center.x * float(ticks * eps)) + center.x;
	c.y = 10.0f * cos(center.y * float(ticks * eps)) + center.y;

	for (int x = c.x - radius; x < c.x + radius; ++x)
		for (int y = c.y - radius; y < c.y + radius; ++y)
			for (int z = c.z - radius; z < c.z + radius; ++z)
				if (glm::length(c - vec3(x, y, z)) < radius)
					SetVoxel(x, y, z, 0xffff);
}

void World::CopyIntoVolumeTexture(GLuint tex)
{
	glEnable(GL_TEXTURE_3D);
	glBindTexture(GL_TEXTURE_3D, tex);
	glTexSubImage3D(GL_TEXTURE_3D, 0, 0, 0, 0, size, size, size, GL_RGBA, GL_UNSIGNED_BYTE, voxels);
}
