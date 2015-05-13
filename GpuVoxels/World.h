#pragma once

#include "StdAfx.h"

class World
{
public:
	World();
	~World();

	void SetVoxel(int x, int y, int z, uint value);
	uint GetVoxel(int x, int y, int z);

	void GenerateSomeGeometry();
	void UpdateSomeGeometry(int ticks);

	void CopyIntoVolumeTexture(GLuint tex);

	static const int size = 64;

private:
	uint *voxels;
	vec3 center;
};

