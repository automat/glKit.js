var PrimitiveScheme = {};

PrimitiveScheme.Cube = {
	vertices : [
		-0.5, -0.5, -0.5, -0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5,
		-0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5,
		-0.5, 0.5, -0.5,-0.5, 0.5, 0.5,-0.5, -0.5, -0.5,-0.5, -0.5, 0.5,
		-0.5, -0.5, -0.5,0.5, -0.5, -0.5,-0.5, 0.5, -0.5,0.5, 0.5, -0.5,
		-0.5, -0.5, 0.5,0.5, -0.5, 0.5,-0.5, 0.5, 0.5,0.5, 0.5, 0.5,
		0.5, 0.5, -0.5,	0.5, 0.5, 0.5,0.5, -0.5, -0.5,0.5, -0.5, 0.5
	],
	normals : [
		0,-1,0, 0,-1,0, 0,-1,0, 0,-1,0,
		0,1,0,  0,1,0,  0,1,0,  0,1,0,
		-1,0,0, -1,0,0, -1,0,0, -1,0,0,
		0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1,
		0,0,1,  0,0,1,  0,0,1,  0,0,1,
		1,0,0,  1,0,0,  1,0,0,  1,0,0
	],
	colors : [
		0, 0.5, 0, 1, 0, 0.5, 0, 1, 0, 0.5, 0, 1, 0, 0.5, 0, 1,
		0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1,
		0.5, 0, 0, 1, 0.5, 0, 0, 1, 0.5, 0, 0, 1, 0.5, 0, 0, 1,
		0, 0, 0.5, 1,0, 0, 0.5, 1,0, 0, 0.5, 1, 0, 0, 0.5, 1,
		0, 0, 1, 1,0, 0, 1, 1,0, 0, 1, 1,0, 0, 1, 1,
		1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1
	],
	texcoords : [
		0,0, 0.5,0, 0,0.5, 0.5,0.5,
		0,0, 0.5,0, 0,0.5, 0.5,0.5,
		0,0, 0.5,0, 0,0.5, 0.5,0.5,
		0,0, 0.5,0, 0,0.5, 0.5,0.5,
		0,0, 0.5,0, 0,0.5, 0.5,0.5,
		0,0, 0.5,0, 0,0.5, 0.5,0.5
	],
	indices : [
		0,1,2,1,2,3,
		4,5,6,5,6,7,
		8,9,10,9,10,11,
		12,13,14,13,14,15,
		16,17,18,17,18,19,
		20,21,22,21,22,23
	]
};

module.exports = PrimitiveScheme;