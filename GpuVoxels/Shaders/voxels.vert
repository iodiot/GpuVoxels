#version 130

// In
in vec3 vertexPosition;
in vec3 vertexTexCoord;

// Out
out vec3 texCoord;
out vec3 cameraW, cameraU, cameraV;

// Camera
uniform vec3 cameraPosition;
uniform vec3 cameraLookAt;
uniform vec3 cameraUp; 

void main()
{
	// Compute camera basis
	cameraW = normalize(cameraPosition - cameraLookAt);
	cameraU = normalize(cross(cameraUp, cameraW));
	cameraV = cross(cameraW, cameraU);

	texCoord = vertexTexCoord;
	gl_Position = vec4(vertexPosition, 1.0);
}