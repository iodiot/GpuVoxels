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

float DistanceToBoundingBox(in vec3 p)
{
	vec3 d = abs(p / 32.0 + vec3(32.0));
  float mc = max(d.x, max(d.y, d.z));
  return 32.0 * min(mc, length(max(d, 0.0)));
}

bool PerformDda(in Ray r, out ivec3 p, out int lastCrossed)
{
	// Find intersection point with bounding box 
	// if observer is beyond voxel map
  //if (r.o.x < 0 || r.o.x >= boundaries.x || r.o.y < 0 || r.o.y >= boundaries.y || r.o.z < 0 || r.o.z >= boundaries.z)
	//	r.o = r.o + r.d * (DistanceToBoundingBox(r.o));

	lastCrossed  = 0;
	p = ivec3(r.o);

	vec3 side;
  vec3 delta = 1.0 / abs(r.d);
	ivec3 step = ivec3(sign(r.d));

  if (r.d.x < 0)
    side.x = (r.o.x - p.x) * delta.x;
  else
    side.x = (p.x + 1.0 - r.o.x) * delta.x;

  if (r.d.y < 0)
    side.y = (r.o.y - p.y) * delta.y;
  else
    side.y = (p.y + 1.0 - r.o.y) * delta.y;

  if (r.d.z < 0)
    side.z = (r.o.z - p.z) * delta.z;
  else
    side.z = (p.z + 1.0 - r.o.z) * delta.z;

	// Dda
	while (p.x >= 0 && p.x < boundaries.x && p.x >= 0 && p.z < boundaries.z && p.z >= 0 && p.z < boundaries.z)
	{
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
		
		if (length(texelFetch(voxels, p, 0)) > 0) 
			return true; 
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
		fragColor = vec4(0.0, 0.7, 1.0, 1.0);
}