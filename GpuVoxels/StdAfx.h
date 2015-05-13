#pragma once


/*#define _SECURE_SCL 0										// Disable STL checked iterators
#define _HAS_ITERATOR_DEBUGGING 0
#define _SECURE_SCL_THROWS 0
*/
#define _SCL_SECURE_NO_WARNINGS					
#define _CRT_SECURE_NO_WARNINGS					// Turn off compiler warnings about unsafe calls of old stdlib funcs

#define WIN32_LEAN_AND_MEAN             // Exclude rarely-used stuff from Windows headers
// Windows Header Files:
#include <windows.h>

#define _USE_MATH_DEFINES								// Pi const and others

// C RunTime Header Files
#include <stdlib.h>
#include <malloc.h>
#include <memory.h>
#include <tchar.h>
#include <time.h>

// STL
#include <vector>
#include <iostream>
#include <fstream>
#include <string>
#include <algorithm>
#include <map>

using namespace std;

#define FREEGLUT_STATIC

// OpenGL stuff
#include <glload/gl_3_1.h> 
#include <glload/gll.h>  
#include <GL/freeglut.h>
#include <glm/glm.hpp>
//using glm::mat4;
using glm::vec3;
//#include <glm/gtc/matrix_transform.hpp>
#include <glm/gtc/type_ptr.hpp>
#include <glm/gtc/matrix_transform.hpp>

typedef unsigned int uint;
typedef unsigned char byte;

