import sys

if "MicroPython" in sys.version:
    from ulab import numpy
    print('binary extensions... ulab.numpy is compiled into WASM')
else:
    import numpy
    print('binary extensions... numpy is loaded via micropip')

a = numpy.ndarray([1,2,3])
print(a)

b = numpy.sqrt(a)
print(b)
