#version 130

// Definitions 
struct Ray
{
	vec3 o, d;
};

// Consts
const float BIG_FLOAT = 100500.0;
const float PI = 3.1415;
const float PI_2 = 2.0 * PI;

// In
in vec3 texCoord;
in vec3 cameraU;
in vec3 cameraW;
in vec3 cameraV;

// Out
out vec4 fragColor;

// Uniforms
uniform float cameraViewPlaneDistance;
uniform vec3 cameraPosition;
uniform int time;
uniform vec2 resolution;
uniform sampler3D voxels;
uniform float voxelSize = 1.0;
uniform ivec3 boundaries = ivec3(64); 

Ray BuildRay()
{
	Ray r;

	r.o = cameraPosition;

	vec2 p = (texCoord.xy - 0.5) * resolution;

	r.d = normalize(p.x * cameraU + p.y * cameraV - cameraViewPlaneDistance * cameraW);
	
	return r; 
}

/*bool CastRay(in Ray r, out vec3 p)
{
	p = r.o;

	while (p.x >= 0 && p.x <= SIZE && p.y >= 0 && p.y < SIZE && p.z >= 0 && p.z < SIZE)
	{
		float d = length(texelFetch(voxels, ivec3(int(p.x), int(p.y), int(p.z)), 0)); 

		if (d > 0)
			return true;

		p += r.d * 0.1;
	}

	return false;
}*/

bool PerformDda(in Ray r, out ivec3 p, out int lastCrossed)
{
	vec3 boxMin = vec3(0.0);
	vec3 boxMax = vec3(boundaries);
	vec3 t0 = (boxMin - r.o) / r.d;
	vec3 t1 = (boxMax - r.o) / r.d;
	vec3 nearAxis = min(t0, t1);
	vec3 farAxis = max(t0, t1);
	float tEnter = max(max(nearAxis.x, nearAxis.y), nearAxis.z);
	float tExit = min(min(farAxis.x, farAxis.y), farAxis.z);
	if (tExit < max(tEnter, 0.0))
		return false;

	vec3 start = r.o;
	lastCrossed = 1;
	if (tEnter >= 0.0)
	{
		start = r.o + r.d * (tEnter + 0.0001);
		if (nearAxis.x >= nearAxis.y && nearAxis.x >= nearAxis.z)
			lastCrossed = 0;
		else if (nearAxis.z >= nearAxis.y)
			lastCrossed = 2;
	}
	p = ivec3(floor(start));

	vec3 side;
	vec3 delta = 1.0 / abs(r.d);
	ivec3 step = ivec3(sign(r.d));

	if (r.d.x < 0) side.x = (start.x - p.x) * delta.x;
	else side.x = (p.x + 1.0 - start.x) * delta.x;
	if (r.d.y < 0) side.y = (start.y - p.y) * delta.y;
	else side.y = (p.y + 1.0 - start.y) * delta.y;
	if (r.d.z < 0) side.z = (start.z - p.z) * delta.z;
	else side.z = (p.z + 1.0 - start.z) * delta.z;

	// Dda
	while (p.x >= 0 && p.x < boundaries.x
		&& p.y >= 0 && p.y < boundaries.y
		&& p.z >= 0 && p.z < boundaries.z)
	{
		if (length(texelFetch(voxels, p, 0)) > 0.0)
			return true;

		if (side.x < side.y)
		{
			if (side.x < side.z)
			{
				side.x += delta.x;
				p.x += step.x;
				lastCrossed  = 0;
			} 
			else
			{
				side.z += delta.z;
				p.z += step.z;
				lastCrossed = 2;
			}
		}
		else
		{
			if (side.y < side.z)
			{
				side.y += delta.y;
				p.y += step.y;
				lastCrossed = 1;
			} 
			else
			{
				side.z += delta.z;
				p.z += step.z;
				lastCrossed  = 2;
			}
		}
		
	} 

	return false;
}

vec3 GetShading(in Ray r, in vec3 p, in int lastCrossed )
{
	vec3 tint = vec3(1.0);

	if (lastCrossed  == 0)
		tint = vec3(0.75);
	else if (lastCrossed  == 2)
		tint = vec3(0.5);

	vec3 color = texelFetch(voxels, ivec3(p), 0).rgb;

	return color * tint;
}

void main()
{
	Ray r = BuildRay();

	ivec3 p;
	int lastCrossed;

	if (PerformDda(r, p, lastCrossed))
		fragColor = vec4(GetShading(r, p, lastCrossed), 1.0);
	else
	{
		float horizon = smoothstep(0.0, 1.0, texCoord.y);
		vec3 sky = mix(vec3(0.012, 0.025, 0.055), vec3(0.025, 0.15, 0.22), horizon);
		fragColor = vec4(sky, 1.0);
	}
}
