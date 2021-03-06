(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Hand = factory());
}(this, function () { 'use strict';

	var babelHelpers = {};

	babelHelpers.classCallCheck = function (instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	};

	babelHelpers.createClass = function () {
	  function defineProperties(target, props) {
	    for (var i = 0; i < props.length; i++) {
	      var descriptor = props[i];
	      descriptor.enumerable = descriptor.enumerable || false;
	      descriptor.configurable = true;
	      if ("value" in descriptor) descriptor.writable = true;
	      Object.defineProperty(target, descriptor.key, descriptor);
	    }
	  }

	  return function (Constructor, protoProps, staticProps) {
	    if (protoProps) defineProperties(Constructor.prototype, protoProps);
	    if (staticProps) defineProperties(Constructor, staticProps);
	    return Constructor;
	  };
	}();

	babelHelpers.extends = Object.assign || function (target) {
	  for (var i = 1; i < arguments.length; i++) {
	    var source = arguments[i];

	    for (var key in source) {
	      if (Object.prototype.hasOwnProperty.call(source, key)) {
	        target[key] = source[key];
	      }
	    }
	  }

	  return target;
	};

	babelHelpers;

	var IvansFinger = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKAAAACgCAYAAACLz2ctAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4AIaDx8b05fV9gAAABl0RVh0Q29tbWVudABDcmVhdGVkIHdpdGggR0lNUFeBDhcAACAASURBVHja7L15lG1bVeb5W93e+5yI27yGzt5CCzUpi8IOxC7FxFFgVmkWZS8KotjRCSKolCZYCjYkCD66FEUQRRpbzARKRdAUnmKThW2KDTxpXndvNOecvfdaa876Y65z4mKRDlF6zmLEiEu8iLgRd88z15zf/L5vOt6FU29941Cm8aJX+dw6bj5tPr6sdTzWsjlBphV13BCobDZrEMGFiGjg4OJtw7k7fMQNedw8+/zd7nvK/uxPO+6f+oknb37Dp7q8eZSW8R7Mmw8jj1AmfJlxZUPZnJLXp9Q8MW02aK4o4BQ0ROLiPLEbnj+uVw//6K/+vpv3//T7808OwLdc/5/vGoI81zPfufeVxZAIwUOZcZsVdbNideutlPWKPM9M6zUBhwNqFRAhpUTse1xIry6++4Hbf/W/f/n+n39//tEA3Lzxzw9ufPOffnNy+QGLhf/ErheGocf3PSiwOoFxg27WrG65xHh0jEwjJRdExK5trXgHUitVhPOH51HCahb3C2+59qO+9tPv+xDZP4Z9AP7/zk1vePW5m//mjS/rXf3sq6864OBcRwwgc8F5j+s7kAKbNZQKmw3HN9yA5ELOMyKCcw6phTJnFGW9WdOnyGJY4HxkmvQNLh5+w0c++Amv3T+KfQDuzv/7ipcu43TpyYfRfcP5w47+oCMGxdfCdLrCVaU7d4BbLi34QoRxRG64gfH0hJynlgEdIpUyz9RS2Iwbcs70MRFDJODRsDzJpIcfbepz7/JdTyr7R/KhdcI//MCbf+dly/ny235wGcqDrr1q6ftFQOuMTGvy8WXq6QrGEV8En3pIHcQIIeJyIaoDVZzbfmsPLqAo3jlEFBGlqlIRQnB9gH/T93G45z3u/Jqf/c3X76/kD6Hj/+EHbn3b33x+Xt/6kGuuXobFuYSjUjcrxltuYrp0hKw2+FJx6w0cHcF6BOdABA7P4ZYHdF1PjJEYI13XEUIkpoHUL0ipw/lAColAAjzB6yKpPPpTLl77ir97zpNuv38sH8IBePzWv71j5wvLwwFEKOOafHJEOT7BzzNRhFgrTiusT+HkBFYbqArew3KJP3eR2PWk1BFjou87Qgx0vqPvlvRpgRLItSIihBiJEe+YP09P3vayv3v64z5i/2g+BAPw+mc/5p4d9bG3u+01aCmU9QpWK/R0hR8zqVodqHnGlYxmgWkDJ6dQitWCKUHXE4clMXV47/HeW80XO4bhkK5bogREA6LgvMdHj8pMlOmuTMfP/avrvvtj9o/nQygA//iFP/pFdVw//3Z3uO01hxfOUaaR+fSU+eSEul7jFbRUUEVFkVxwahgf4wbWNv0gRogBFgtcGvAhAaHVhIYNhuAJISIizHOm1oKKAkrwHifl87txfsFfPe3/+vT9I/oQCMC/+a2XXnt809sfFZze/rYffnu6LuFEyJsN0/EJlIIDBAz/cw5RhZKhCkiFcYLTlWVCHPiAiwHnPKogCrVduc45grdmpZbMOE3knAFQLTjJyLy+e5jWv/AXP/69d9s/pg/iANRx407e8rf39nW6+/lz51kcnEemGfKMKzPROzofid6yl/Oe4D0hBFBnAVmAWiwLrtZQs/1/5yzyRNFSKaVQaqXWinMOVUWkMm5Gcp4puTDPMyoF6oTL6w/rptMX/smTv/PT9o/qgzQA3/DLP5Wm48v3kHmM19zuWqBS8kQtMx5YLJakoUdwFlA4fAh4H1GAXGCaYTPb+3GyzrhUyBVE8VggqqoFYSkGy4SAKkzTxGazoWw21Jyp80ypGckT8+rko3Re/dQf/+gj7rl/XB+EAZhXJ4fM891SCBze9loIDqcQnGPoO7rlkm55wLBYWNbDAkkR+7NUZM7onGEuFnyb0d6PM5ILVG3VH9RSqC0Lgl3ntRbmzYbNuCZPG6Z5g2qlSkHLBNPqk1ydXvj6Jz/yS/eP7IMsAH2ZPzyU+ZOHGEnnzsPQEYce7wMhJHzf4Q8PiAcL+mEgxmhfKYJzvl2lQsmZPM/UaaSuR2S1om7WzONEyRmnLQhdQHGUUgneI1IoZWaeR0rJlDLhnAV2lYpTIarg5vU13Tw++/onPeyr9o/tg+dEmcf/0deJbujAJ6DglkuiCIg3aMU5cB2OU/w8oUXIpRCDw4mDCqGN3Wz8JkitqHNonSnqQD3ORUKwSQhqmc9aG6Hk2T7Hd5RaSdGjJeNCouSCC5Xq5HwgPuePnvbIe7FYPvouX/+4t+4f4Qd4BnRl/DCHElLEzbN1saoGpRwcQt83aMVD1+OWB7hkE4ycK1KrZbEGpeRSKNmajTxPlCLt4xlpzYfD4XyAEMB5Iw16LDABVaGKoKrUFsy1FGtO8tTpfHK/sjn6+euf8ag77x/hB3oXrOVjcEKMCeYZ1iN62UZuxGDTDdc4CyGBH3D9IbFbWE1XrbutrculSgugiqiiYpxAUVC1AHPBWwPjIAZvNaWHlALqwHkHKkaV0IpopkqGkm14VydCWX+Wm1cvfs3THr7HCj+gcUBRid7jlNbNTkyXjjm64S3I5SOoBj4jAhXwAVKH7wecb8EjgCrRBzzWxEgRpDSYRr3hgd5Rq2W2UjMpOVxQnBe6PuK7gE/O+IPa8MLgiMFww+AsEafgiU4IMt5p4aYX/+4zvv3+L/+d57v94/wArAFVBIJSa0ZLQfNEHkfGk1NiFg4vnsctDwzzs2iC4CEEQkzkXHEIDkct1ZKWKt555mwkVA2O6huGHSNahW7oqDI13E9xwRFSIMUOJ0oQKEXAB7w6vPfWd0vFa8BXT3RKzeNHRvxz0n/9Awc8Z/9IP8AyoKAoRjSt44iUSpkm5tM10+mKzeVjytGxQSzb+lAEvMfHDucTPgREhSyZcZ6srVALOHEgbXJSAIIn9ok0RKCS84RDiTHQdz2pS7jgcQ68dziU0AVcULwzeMirglOcg+jAy0TS/BN/+PTveND+kX6gdcF4RDJlHqnjBpwaJFIL0zwRxkjOwsGhI/YdaAYXQQQVR4gRqUou027CIdkyYowRcUJRpYgSU8RFZ3oScYybFU4KLnhSSoQQcGBXMIr3alcxHlCcp01JwPto17pziFZcWYOWp/7xU7/9tmN38NTPeNDjL+8f7wdCDeiDU1VqHjm9fBPztMF5EMmoVqZpZhonVsfH1Cmjc0GnGZ0rtaqNgsXhNFCKUuZKKdUIp97jY8CnSLcYCCniY0ApTNOGabMmxkjf9zjnyTmjIqAt+zl70wZY4x3iLPshBSh4bBbtJON0TFJX39vNJ8/7g2c++qr94/1ACMDYXQJPcJ7jW26hlpEuRpyzms47Ry0z0zRxcnzCZj1SimVHUet0SwOlUVAcFaU4qxXFRzR5Ut8RUgKpTOuR08tHSM1EF+hcwIs1MaHlO4AqNi3RViZsO2i8BaPWimoheiW0jjkwhyDrL6qb4+e/7hmPXu4f8ft5AMa+/3XxAa1CXm9YXTom4Ik+MI4zpWQbl6kgVRBR8myYXq1i2U6EilqXa7g0VZSCIE4JIe7wvWkaObl0ibzaEAVi4wp6hYjHO7u6nfMEH8BBCNGu6C7gvUdRRAoOdwbtOIen4ihEn0mM9075+EWve/KDr90/5vfnDEj9M3z8k1oEKcLmZMO8mUipI9fMNM04IPpAVaVUA523gYdzEALFOTQExHkER1FhauAzIogq87jm5NabmFcnSJlJwQgN0r6Pa9cuCM4Jotm4g95f8XHLiK4FoRYrFZy32jI6QApOJlxZ37tz80/+/nUPvcP+Ub+fBqBbnNto6F+lzqNSGdennB4d4b0V/uNkCrftm4qgVRDnwHkUh4segjf+X/QIFnA0aEZKoWxWrI8usTk+QuYJp8XqQ+d2mJ+qUKtQa7HJhwdxFdFqWU8BKg7Fefv8GDzBOVQLqhUfHN47ovc4MkHm+8Saf/F1P/7Ij9k/7vfDALzr/R49+2HxGt8vs9NIdB3jxuayKfbM08jJyQk5zxZ8DV7xKpTZrmhBqQHmWnbQi0rFe6gys1ofsT6+xHj5Ei7PBKk4EVyteHG7q1dVmeeZOc+o27JuwCHtyjWM0Ymi1aAb5z3RKxHBq+JqJTqIQYkozs/O6+bTY1n9zu8+5cF7cuv73xUM/k6f+lKNw8uK75hrxXtv126I5FwYx4nNZmSeZ8ZxpFbrjnOemfLMZprI04zUwjxtyHVC3IzXkZLXzKsjppPLkGeCKt4bUxonVCmIGtySczZ8D4d3fscXNPjb6FkG9UDE0bnAEByuVjRnvBSCFpxWkg90yf6eLsAi6YctvLz895724M/fP/b3n7MbX73hJx7/UC7f+sPzya3pYOg5WC7I88TR5cuklFAcfb/Ax0SKPeocuVS2wF2tFXLBORjzmhiELnk2p2vKPNt/0wYmB6v3QvQtGB14dgxp646C1ZQqVht6T1WDaJx3+AA+OFKMlFyoauVBaHJQ9VYeCJ4QO6o6anVM6m6Y1T0u99e84O7f8PjVPgTeDzIgQH+7j/5VOTi3jqmnSiWXSgiRYViwXC5BlfX6hNXpCavNKfM0Ma03UCquitVsTpimFePqhPH0hMs330Jer6FkglO8F9Oxdx4fFOeVLR1Ltb2hiIcasPFcDMbAbkImI1dnA5+d8QodxpmgXeOqaq8sFXyw4PbB4V0lufkjej8/bZFveuGrrvuebh8C7ycB+PFfdL83pmtv95SpG5hyIZdCnu0hx5RQFdbrNdO4YlqvKGWiyIRoQTWjdaLOG+b1ijquIWeSQh88ERuhpeRtzOZNW2IwiiAmd0L0ihrT+5b5GhEhREAJSQkxNE2KXd2iYpoVVYJr9WSbyqAVT8VrBVeJoRJd7pKb73Pe3/hrr3vqQxb7MHg/CECA7sP/1Y+k87d5MzFRcmYzGei8Wa/BqY3WRIwsKpl5WpHnFWUemVanzJtT8rgmVCHiiD4SQiLGSAiQYiAG33xjLHh88Kho63yrZatocIyIok4RpwZKO2tJfINlLMCaB2FV+2VEcGK4oIrgVJGS0ToTpeDmTBAhUFlovecy5Re//roH33EfCu/jGnB7/uyFP/4N6xv+6ln9eGIYm5jM0gfIs5ERFosF0zRRSrGMo1DqjENArPJKMZ3VY5pRKp13ZBVKKQYcBwOhc5mpiAVWivhkzUcVCJ0RWFWa14w3zM8BwXsTOEnFo9QqxBisrgy+jf2czZBVkcawUR/QmPAhIkRK5Y+KDt/xF/Xa3/rSB39P3ofF+ygDAvj+4IXh4MIvi++oVRFxgEfFkUIkxYQ27l8MkaiAVDrnGFLHou8YhgUxJXNFUCxI2RJStVH8z0Bn75XgHT4FYop4H4hdwAe1LOY8MQa6lAi+dcfeI6rtexib2ubHNkcOzuFETR5ahCBQ54mAEJyjD4EYPSko0cldopt+9hP6W37ht5/1nR+9D4v3YQDe6Yu/7lhS/9SShmN8bMEHtQi1VqvZqnW/yXucb0yWlEgpkbrtlRt316yqaUC2NC3nwGEdseHZHu8dKaY2DWn4X7Dv7501IySPCwmcSUNjSo2oYAIqM/tKqJouBVWkGOY455k5T+ChiwlPe1G0qUpEr42yuc9B3bz09575qP2V/L4KQICP+Iy7X99dfbvXZN8ESXaRNbGRTUQcrhX8vgWDOWHFEIkhEGNoNZxFmThtFCtHlzpCtI42S0Wwz1Ow8R4OWh3nnMOliEabC7tgXjPBG60/xEjqEhocMXlijGfQDvb1cymM84SKEpw1MCF4ovcEj7GyKagWQtncNeaT51z/1G/72H14vI8C8LZ3/rzjeM3tH82F29w0YbNdMGWbjeSU3LA3GiXf0Ww4oF2/jq5P+EZ59WELkdDmvgF1EXXeWM8hWIYVtSBX64xdCK0Thhg9IRomqChiheDue7guodG6Z7uWLWujSp1KM0qKJiEQa14CjojJABJK8kLU+XOCzM977Y895PP2IfI+CECAT/jfv/YNy2s+7PGyuIi4zhj5OFQctQhS7XozZooFZW0+0GJPlth5a3Ncg0uuvFbb7Ni3ZsCH2ALkbDackjUyqq2+8+yoWNKyYYiR0CVCnyCE5gSiRn6YbY49jiPOQdcNxJgMAgrOrmF1+JbNg7NADEAf9B6Dm3/2+qc+bM+yfm92wVee02kV/uZnr/uD+e/f9Ml+OkbyjFYh+GDXma+EdsWG4EErOGF5sMR7ECmWKWvGeXPVirtJxdZS0GrEHRzj1EgGfUcIgdqajJSs+SH4HU8wBLtqXXNc1VrtRVErWjJSy25s2C+XnDt/gRCTTUdCMNWeekqp5Ebvct6TRahiNetMd1Jd/w3r4aqf/5z7f4/uQ+a9lAEBDvuDurzm9vfxFy6+oYQOYsLFQNGKevMkKg6KVGO9iCAC8zxTamXMRlTwwWimLgaIwcgKzu1Yzzh2YnZzzgqEneuCTTZyyTvGjHMO7wwPVLX60W8b7DYFETxzEcYp431i6BbgI/iID80qzkVCCPgU6LqO1Nn6iT4GUvB0ITD4ci4x/sRyvPGrfvsZjzi/D5n3Ygbcnj/5mSd/5ebGG56rx5ejl4wXq9W8M8xPSsWrNCIBpM5o+NKoU75x9ZzHSAiN42J+gKbpgKYHDs4sP6L50BSRnbIuhYhvzctWeacqOO+RKuSSqVPGA9M4UvJMSh1d1zMsDghd2k1gfEg4b1kQh9WeW9qZCuICApZZBcYqlNA/3/fnHnKX+z3+0j503gsZcHtu8z998kuHq2/zZJYHSDARpppXGw1hoTpjRVenFDWHBDSgzuFC2OF+zrs2arMM1uZyOO/aQK5lxW3HXQoqRpYtpTkxNGZ2lWruCbVSa0FKJefMNM/UWun6jtR1pGGBazIDVHdzY+d9g4zCGdHVW3Z2HrxTI8RGTxcdg5evquPJda9+5ndf2IfOezEDAtSyiX/6/Ke98vhtf/15i3myLUnOSAgi2brIENsDtiCKIeCasJzGgqEFQa1CiNtrtOKclVdVtzVhaFrg7RjuHQNZMFgn+GBBWArzODGOo21lipFF35shejfg2+c554hDBwSCt6lJrbITRDnvKA0aolnSqffUZhsyZiFL+i0N3X3/lwc+cb9y7L0VgAB//esv/qJLb/rLl+S339DF+RTJE9RCCM5o8wC0mazSMLmm+QjWDdvgtv3lDmPENCZMiH6HM9L8akptyuXg2jXtKSImSsJIC0gjss4zAIvFgr5vQdf+/ugN5oldguCIsce5COoZx5HgPTEERISimSnPpksJlsXx3uxHRJgFKuG38f03r9Pyzz/jq793v9/kPXkFb8//cM/7/urB1bf5tnDx6lPpI3hvwvOtkVDz/NvWVduPiwpSbV3Xls+HM5az1AqN9XLlq8LhqLl5zeRqLbMoZc7UnMnTbP9dlFKrzaZzZrFY0HUDodV4MYQGWis+NkWd8xBMvZdVmnQ04WIkDr1d26kzxvWuWWo8RpToFK/5syLllcO8efivP/1xaR9K74UABDi8y6f+RHfV1V+ti4O3atP8stPuNj1Iux63Y7htYb9NuDYS1qY7AU97yNriQ9WW3dQ2/kMJ6nAVtEqDWYo1PrUyrlaWxVIipQ6R5szgLM0KSpFqE5sY6VIPOKRaRz0sFiYb7RI+RnywxiWlji4NRN/hiUaE9UoK0EdP0nz7pJvHX9td/q7rn//YvQT0PX0FX3le97zv/zflrW95sdscnU8IKtk0vU53dCgcJGxUF7xHXd1lFZFq17Jqu4rNZmNbH5ZSoAmRfGsgRIRSC1nrDlPEwcnpKbFLDMslqTO7kNinHU6ozZlrGAaC7/AxUqQgAl2/NILDltzQenRVpeQJkdpM1q3hKVSbaysUUeZSEecoGv6wuP7LP+X+T/zLfVi9FwIQ4L8883vuxeVbXhrn1QHVyKnROUKr3wPesltTqokWupRa/acN92vdpne7GmzX1UqrDVPX9om4NgI0vLCKKejGeeLg3Dm6vsf5iIZA1/dmJSKCCvRdj297S6BZf7hASkOzHt7WpVeM8aQgtaAq5Gzvq9UQqFRwgWlumhbvyRreKs59rUsHr/nkr3rcuA+v98AVfOX5zAd9/yu0v/hIunM43xHwuHb9SRvJVQpCRV1FtFDqjGqh5EzVSqkFVNpuYQvIrYe0qrYJi5mbGwmCHZRTSmHOmdR11nFbG40ToEE4JRv3kGiBL6WgVYjeoJet0GkrcD8juxrNf8u+TslGhiHGVg9adu36nhgiyXm85jt4mf+Tm0+f8Ps/+Zg90/o9HYAA/VW3+WldXnxx7Q7Bd4hzzCU3U0pjMWvLVDjdeUmLmr6Ydt1t32ozuDzLhHVHTLCsVBE5C8gudSwXS2IyKpd3Z1MUaeJ5n1JbHduM0WkLE3MxtrRkE7lTadtQjEwbok1lmhbFGN2NTROjsW+asZJzjs47okpA5oeGvH7Wa5/5yD2t6z15BW/P7z3nh/91vnTjz/nxlttq3lDnDV4zMXm6EG1s5qDWvNP/xhjxWCaLweEbfFNrpbSFNjs/Qh+aCN7YNKVdwTFGQooNTDYPasVTt0o9FdJyYLk4wLt05t6l5tYAjr7rDatMsTHPHCH0DRIqO6tgFXOoKVJRp6DeiBeNe5iLjRJLLSiOOc+qGi9NNX3Tp33Lk160D7X3YAAC/P6zf/Dfzcdve5asL13DtMJJJkY17xcXUBF8kBYEnhQCbosHBodKITm/65oN0lGq2EKILX1fPRQp9N1gmSnZDpIYAs4lNAYUGPNE7Dr65YK+X+AIZpze7EW89wa1NOKs9wZ8+2CeNEb7d5SS8T7sOnuViqrDEQywbvDTnG1iU6VSWhNVVBFNedb0I6E/eMan3P9xb9qH3Lv5Ct6eT/2Gx7yUCxcfIIvDt0u/oPqAakDxO3crEd3VV9L4fLVWo3eJs7mvthEbNhIrtbZr16YU4iD1S1K/JHaDtTmNkbP1s85SIQTS0JNa02MKutqE9aZZ2ZIdtnNpVSPabilmVWqjbpm+xDDBdiW3UaIlW0/0luU9ELyjTx2LmOi9pN7nx8Q6/drrnvGoz9uH3HsoAAE+84H//pf94tzXSL94m6SIeMdczKCyNt+XUuqutitSd0C2iJKrkGshq9m7FddUw6qG6QUjlA79ghiSsbF9tCDxDvWYfYiDxcGymV4mUCg1M44jiu52GLsWeGaoLrtar5WJSBVCbNlPmszTeVzLlm6n0DvrnkPY1onmBOuSJyUl+elfRZ1e8Lpnf8f/uQ+791AAAnzWtz7xlXFx7uu1P3dT9h5FmGthLsUYzM4jAiqmNdEdMt22KJXS4JD2YIOxpi04It7beM8sPcSuzhjJDVTedqapaVRUhFKyedvg6IcF/dATGrX/zAg97CCailqdmdrsuf2I9v3DO9rCtf+BjR63Tq8hBts2lTqSDwQvDL7eYVnzdb933cPutQ+9d3MN+A/Pq57xmCfr5bd9G5uj4CWTMGXa2fRjOxYWnFNqqSjZGpT2EA0c9o24YA+361KzAhH6lAgxUJ1lVO8TOE9cdsSua84JhXEzE3wk9h39YiA23K9W4+bH6ImhM3oXrmVD3zJgtJKgShNPeVQN3K6l7kaNqiYrlSYpKLW2rF/thabC1LrwUlkV9X+kuAdXF960CRcufe7Xf698KAZgeE9942//vme8anPjG++Ad3eVPJmY3bkdq2RroyHVrsCipUE3dhWqWiaS9lic3/pEW5frvDub7bZu2fnQnFhtPCgibDYbRJS+H+h6y3zacEoVJYTti8L0LM4bNd+1zCeN8uWuEMSLCE7bxFoV50zzsiXM6nYW3hou7+1zg/cEE+d30etHBfQBTvXeSdY3fPTdPuWvfuM3fl/3GfDdeP7gl561WL/1bx/nNpceyeoWYi5thZfg1RwMpJZ2D0uz+Sg7IsGWeuW9J8bUJioB9SbTNKzOHqyo4FM0QVSMVMXsRXJmGAZi6gmxM2C7mVtuu11wphXZBpn3aBFKtnGgZePQgnq77SlYPevKbpKyBbStgzdaF4RmXWwvNsVw0e37BtrfVIq8ZFPDS8LB7a+/y/2+63gfgO+m84cvfOpyc3TTE/X0xm9jfSvkGV8ta+R5JGy9pcU2IhnzxLKUD77BI4b5bZdluxR2UtAUPXh27qpd3yPqGBtQnVIyjYpL4EPj/NkocNs4OGdu/6E1FihsNhuCC6Q2vnPOtCjemdBKcZQ544LDBY+0Tt2uYbHr3NvMWKpl2VrKzhG2NqKtOgdSUK0yZymE7g1Zu/vd+QE//Cf7AHx31YO/+JPDcPPf/cdy+a1fwXTk2axx2HTE2YgDKdWMhBo1y2jzhgsGH3Y4IB5yG9H1XY+LioueFK3pqLUyl4p603lYxxtAG/u6mR3RDDB9q+tSjNTmJXPlZvfke1wwF4gtodX2HuedQm87zQm+yQW2wnrvm6lny5h1NlpaKdQ67WSqqkItmVK3yxnJojyhEK/PhN/41Ac9Zb0PwH/hef0rXtaXv3vdM+rp274uH92EyzOOahmnVGouON+YMVgQiogRQlVt3NV8X/Dtc4Inpmbj0eqzOduWzm4Y6Pu+fb2AnlHwzXnVlHSLYbAasI0C53lGaj2j6uMJIe1GcrWa0s83xy5x8g6lgg9NdNXcZLcttIgi2UqCnI3ksO3itVQzfm8LeKThkHNRIP6kpuHpd/2mp/3ePgD/heePXvzM5erm//YD+ejGh7r1EV4EX410aqO32qYSTREnVszXFhAuhh3L2vA4bPdI5220pkqu0B8s6fsrQOiWoayWNMcGESG2DOkxYsM0TdaEeE+XkmVEW7lDTKmRIppDa4wNlzTw2++wSAPatYHuIkKeJ+ZpavYmtjG+tjm4x1GzsX9qA90rpQHn4EiIT2/OGn/m7g979mP2AfgvPL/17O87dNPRD7O+9Zt0dUKYJ2qd2w8ieGc0KdAGrfgdszq2azYET0WNyRwjBJC6hXAGhsMlKXW7KzNcgfFt37P1tPEeaYzq7Yw6sV93ZwAAIABJREFUek9ygepgLoXou3a9t6BxzsirwYIvhmBrKtCzhd6tKcnjms1mQ6mmV6YB67VWSs5ItmZpuzPPBPwWjD5EY3XHDnxXV5nXh2F5v895yNP/Yh+A/5Lr+FeespjfcsNP5Us33pfNsZd5JOCoMtuyGaVBMYZUN8wXHyIxeqN5qVj2SpGK4W1d17FYHrRdc2ewyfY6vZJylWKTeLZrt9ZqgRoC0VlmyyWDQkq91XbVfoaQLPAd2vQDdh1vmxrF5s2r1QnTZjSGd6sJS1Pt5Xmm5Mw8tX3IImZP3OpU37YAeB+IoSPGjipKxr+x0j2wuvOv/vxH/ocPeOzQvy/+0k/5tw/dXHXHz/zaeHjtC3S4itANJolUR9DwDq+LKoLiCLHD+7ibE5uXjAG+iNLFjsVi2a5ou75dFfxWRSeyY8OEYISF3EzXSym7YPXO4JMpz0jLiOpsLlz1bE8JKlTJlDIhJdO6C2qZbbPA0SVWpydANT+bwE4yutlsWK/XbMbJRP3YqNE1K2K/g5ns36KKjSjVKUHLHb3Ov9bJ5a/aZ8B/4fnd5//YQb71zU/U9S3fqutLxDwaR1ClMY63/oFph7WVMuGSrWcIMeAbYTSmSN8PFmwOtFaij5DCjlS6a2a2tVnO5rTVrujQGNnbYA3BOmkVKzHjlvjqbU/JPM/Nc6az5ghzhVivV2zGFSlGYmdX8jRNTJvC3LZM7ZaAa2juYGduYDuhfFFKNknANis6rMasGlcb9Y++56Oe+7R9AP4Lzuue+4Pn8snNTyrHNz6Qk1tJDpBqeuNmFLTFBU3YbroMHw2c3vIBvTdLOPzZnDaEgIuhBYg/y36qTNPUruLOQO42t1aVFlgNe2yuYHjHMCwMyHYWvKUUhqFvdaWB1CerYzabtQVfsuDLc2aaJ7ymnZTUYBuPqGsODUbICDHsOJFOIvM0MudsTKIAwYXmj+ipGlZF0g+7g6t+4B7f9EN5H4D/zPPaF/3H5XTjnz6Po1u+xK2PnKsZzROzVrrYNYtek0UWbBWEbd6MOxzPu2DL3GOgtNUOMSYTKQXzm9l2wzlnE6+HSAz9GfHBO0Qn5rnsvm/OBU9icbC0kZp31DpTS6EfbK5cRSg1k/PEyckRKZhRJzg245oqYgEZrZbzzoLMBRv/qTS7koYpztNsxkxFGceZaZ4oc2lbBJpcIBmbp2igVP+TqYvffveHPPPyPgD/meeVv/jsxfLv//w55fjGL9f1ETFnihRUw24ua42IPSzfBWI6ayysgzX1HU7pUjLoJPqdxRttCqEofTcQQ493V9CpHFSZdk1PrbZ6duiWDAdLvHPMNVPLTNfYNjgrGVanKzabtXkY+ogI5DIz1cLQ2yLuFJNd1eqtK6ZZfzrjIAYfDIdUpUs9pRTybNsKcs6spnH3O9ji+rYRwAU0pNcI6bu1X7zus7/5yfM+AP853fELfvRwOnrLj5STGx/E6RHkgtQWYCKkZAwX13Z/hOibP4zsIBTDEaHrEil2aHPcDw0eKaW07Ne3WbA/s+yInioz3gfGccM8T3TdwGI4IHap7bGzpsIyWkDKbAt9jo9xOPqht6ahVKQWuoXpi30I9vMI7bpuQixtM+HWaFSpDMMCnE1mSsnUokgR8pxt0jPPlGp2cqLgYjLnB/zN4sIz3XDx8Z/9rU+aPhACMLw//TDPeskr5q//0i98jajeXit3CdutmM23L2zdT73x8moxoryIdcLSXLu2Ll2CILmYPVxoOKALZsmB2+lTaAFYxJqSWo05bV6GCedpgV7NrChEbGmiUOfM6uQUqZU+dUhVxnkCteYk9X1jwITdPmXX2Dgl57ZCojCOI/O0IYZEF41Wpm0NhbYJSfAJ37aT1mpfP+e825dStS6Dus8h54+7593u89KXvvrV+wz4zznX/9LTD6Y3/+UL9Pjmf+umU6elsZHRxrw3EHm1OUFqJTgDk60R8Thv5kYxBAiOxWJpARgCWpshkgjdMDQYb9t92gqIcRxbx9xZvekjzpsKLjQqfvCKzIXTk2PGadqB2qtxg3rPcrmg73u8t2VM27UU2ly8dM6sVqctKwvraUMaOg7OXSR1pmkWrZQilGpXbi652chVTk9G5pYRYzNur2quFMFFsnZvEN99Yy1y/b0f+5N1nwHfhfPsn3tZ/rIvue8vd7HcqUr9JFtE3fC3bT3ohHmezrh6LZtt5SFapREabPGha6hnpe7GZN77dsU3WWjrbnPO9N0AeGq27x+7jhTSGUCsyjRuOD1d7RbmbDYbSikcnDuk6/rWvVdEClCpJUPJ1HHDtFqxPjqhTDMnp6c4Z+L50BzAUoxNfdd0NEb5scXik01NtrPu7YsyNH6ijR25rap8NXD4ZZ97l9/72Vf98bQPwHfhPP9XXpG/7Sv+3cul1ts65K5m6VdREXAwZ8tSiO7EQRaAfsvzt5ltsAfp3bbjNCPNgFK12rWOZb9SMtM0WTMTEnm2GXRMkbSddDR5qdTCerWmtI51vVqzXq1ZHh6yXC6beWbTkiAglbIeGVcrptWG06MjVqeWwb3zDO2qttFeJKSEVDmTCqj9eZ62HfiCvjMIKYZg6zFS3L2YWshGB/fwnjt+zb3uftXz/p/Xv34/CXlXJiZf86hjvzz3SF2cf76moWF+CQRq1Z2d75bJYlQp1+asxVjU23qrFMrc/GvEMmRtjBTBJh3jaF1mjGca4t0W96Yhldr22VVFSyWmRJ5mjo+O6VJiMQw4UZwImgtlnCjjSB1n8nrFdHrC+viIo8uXrHzwnpRMO62lInPGVYF5RnNGc4FScC3rehX62LHse/va4FgMA4thYOhtVDkMva3KCErwhYDc1+fpx17xgw/6oX0N+M84//UXnnV4+c1veGE9vuV/7clO5pFSpl0G1Mbb382PkR2JtRu63Wam4P2O1YJzaHCEaN3yNNt47Pz583YNSthtaHIhkFo9KTXbbLdkpvUaVeXy5ctcvnyZ293udly46iqTnTbSKRRcGxeuVxum9Zrj42MzRuoSw/KAvl9YY9Vc//u+J3advbCcwzcW0KyV1Wpi6A9sW9ROr7A1/azWALloBIdcydXqSCEhLhVR/4Pq4hO/8LueudpnwH/i+eQv+cbTaz/ubl9WFxd+aQ49tAd1NprybVSnjUi6NSF3uwy4XQW7o0OV0kRF1kmv1+sd1UtUcMFRpFBVd3rkUsrOr8Y1pZ6UwqVbb+VwsTDGTC5Ibj6GpUJR6lyouVBzZrMxXXLfd0bfalbDHkfQlgVLgWocyWm9RnIGFeb1hkUXWQyJztuinS5GUvuzsXHaWLLr6UKk94GEI2olUWOgPjZQf+g/f/83ftQ+AN+F80n3/spTWV71ddpf+GlJh6hPRjK1xcA7b5ntkSZ+KtXER41H37h4te1ENtr+PFt9nlIyUqhihX6VM6mm1Caositeqy3Ivnz5Eq5BLkhFa1u63djVZcq2UDsXxnFDzjN9bwaYwUeqmCLQXhiZMmer86aM326C17pbtLMchmYWW0hebRUtBakzSDGvmka87YeujR6NZxm8Er0SkG8JOv/iyx//tT/6n57woI/bX8HvwvnN6x51tRuPf9xtjr9cNid4LUjOTY8R2hoHC5quS7uFiLEz3uBWcO68x6VA6rod33BYLnf8wHmuLIYlaeh2NHzvPU4FJ5UybphOT3nbW99KjJFz587R9wd0KeGDWYp4VeZxhdTCZrPh9PSUlLodEK4Nc9wu5dluDwghMvRG98q5cnjxkOIcXb9kcbBERZimyTaTOs9cZ0ptL4Lmj2NrKgpztvo0FyXEDucDuYKYtFQI/q0V/5jDq2/78s980A/euA/AfxKB4UfPj5fe+CI/n9xLV8dQC9p8AxWhGWbY6tZgQvIYnDUbWpuLlsd3idglpnk2zXHf72bFqo7F4oCui1YLNjmnd0qdZ8p6zU1vfQsnJydcvHiBxXBA1y1a0BsAXspMnkdECsfHp8Rk8+AtuyfEiDShlVbLmgbzQEzmSxN84MLVF9EYGA4O6FLHnDPTOOKc6ZDnXBgWB3RdhxAoIrhtHVhmjo5O7IXoA6VCEQtAH2Jr2IQa/I3V+3vPOfzxFz/22WV/Bf8j5zO+9hHH8SM//r4cXPxVhiWu61BvM1jvYvu1tOmOrf4rYoG1zXZtvrcjo165FKfW2tz3hVotK0mbNsxlpuSZcRo5Xa1ZLJZ0W8ywGounzOZ/OM+bBiZb3SmKBWGK5mkYEzEkoo+k1JO6nuAMQC/ZsmZojJoUItKu6VoyuUzM84bNZmMM7pR2dW9qbmGpkWZTl1gsFywWA8PQ4QNNjG8CrZg8UeS2oZTf6WR68iv/72+8xz4D/hPOf/npx13lTm99Wjm+/JV1dQnNmeDMiRVtixa2i2/AmguPdbZx622tqPNm3xuCuRoU2zESgj3IGGNbI2HrIMpm4u03/D11mjl/eI5hsTBIyDm8xxRztTJna2yMgDpy8aqr6PoBt1sva9luK0U1wbu9jfOK1XrFhYtXs1wOTQLQKGc4Lp8eU2qlSwsODw6J/aKJoyxjq/fM88Tp6RrfXCFy2yawyTNSm6+3uraurAW3gA/djTXLj3rfv/QLHvvMv9oH4D9GYHju919zfPNbrnPT8ZcyHRu1P0/UWhosY9etqGF+MdpVxBUakZDassTgCW7bTSacM4ZKiAm0gIMyzRzfeolb3n4T5w8OWCwWDY9LbNdwzvNELSYvUJSTkxPAc/U1V9P3i7ZO1gRT26y7hZB862hvvvltlFpYHhwwDD2hj3TJ1omVUrh8dEQces4dXNgtfIypt2ALkSLCNE+s1hsWiwOcD8wibLb8whb8huTYRGieJ2oVnO3PyzF2t6hzv4BPL7j6Iz7qL+7yNd990z4A38l5zZ/d5PWVP/AMt7r0wKCjq2WCaoKfnfsq5tbqmobDR2supK0P6/sOvMe1a9J7Ww0bnN8t00Gt+H/7DX+Pq8rB8sAmEA6CNn/rMiFSKPNIrTZZOT054aprb8O5c+dJaWgNjb04nGMHom9dGcbNhvVmZY6s0dENHanvdsTa05NTRITh8JBhOEcIyZY7xmRlSLCdJqv1ioqjH5YUUarCNI0GzGO6GqeOUsyZVmRbLlRK0cYQV0LqURf+nhC+4F8/4ul//iFfA/7D89mfeBv5nIf8h2+si8PrSrdEYo8jNe0GzXnBrhoVWzlS1R6IYtMSq/XMnEjbtaS4RpGStouumL0wSrdc0G39B9VoYTlPlDJT60wRawBOTi+jCClFc3DV7U6VdqXX2myJrUY9OT1lnGeWB+dYHBziQsIH4xGqOMbNzDQXUtcRQmdmn6lrqyRa7StnO1v6RlwN3kqEFCNd3zHExBASwTtSZ+SKrov0faTrA33nUM14p+i0wU2rD3fT+qW/9YT7/8/7APzvnOl2H/9wXVx4gnRLavCINwbMdg9EBWoLrpyb8WU1E8ratnXutrY3Y3RtGGBpDUYuBQHSoocU2LpS1mqAtvc05rRysj6iCByev0jqFs3pgZ1hka0IswZlHCdOTk7fYdVYij1d16PqyBnGKXO6Gompo++XppZLPd7bPHhnc3IFJuoxkq7Hgm8xLFgOS7q+N1lD8CRgSJE+ePoY6YInBkgh4BFrfrKgtX4iUn/6NU98wCftA/CdnC/8iodmSRcex/LwSXU4UJc6NDhcDIStGAl2W9RFlJLLzoZjt1RHxKhNxRoXA6+VOVemKbcHn5oLF4bnecWn0By7PHnOrFYTF666isMLFwldB8Hjom9Z0MBnbd9/mibGaTQOYduLYoZGsFnPnBytOD3e4F1keXie0C2IyURS5vbAjoTg2u/lg99pl0MIbaQXbBkQSgzJJia9NWCu6WZSiG29GRbY0REjlDxR8/TJOW9+9TU/dP93iwG744P0/MZ1D3uOHh99nZtPXWzehJtpJJe5rXc1TQbeGaukrWHYNiZbQZHNlm0RttTKpcuXcDiuvuZqUgygFcnNWLNkgqvMm5E3vflN9H3HHW7/YYTU07VN7Yg0fYenFAvE4COr1RofAheuuoiP0daCOcf69JSjoyOGYcGwXLA4XHJwcEiMoWXKhPddww/b9KcYwdXY2L2tnlXFxdCM3pVxHBtNzbempNmBtKWN2x0s82QjzJyzieebW21M/ZtD8Pf83Ef/zH/bZ8B3cj7/W578AD285llueRENC2Y1Gpf3sTlk2Voxbatlzcptbmtc3Q4PlNo8DKtNFaZp3i28FmlLHVIkdAlxylwyl09PUOc5f9U1xOGAmBbmzIUyzbm56ufd5ENEIUb6wwM0JULf46K5LZxu1lSUtOhZHC6brNTvZKA2cpQzzmEtzNNE33V0qWszc7/jSdJqza7rDF7yJuRK3qSry4URabtWO3ZdJKVIiomumX4G5ynz9JFa60t/83Ffeud9AP53Trz6Dg8Oy6t/ZHQdYy5nAibODCq3UEhuM+J5Nr6dTQhmahmpJTea/sQ8z2ebla5YA7b1st5sRo6PVywPznN4eJUJ6mOkOmt6tko474N1nbVQUPqDBd3BgtSnnS3dZrNmM02cu3CR5YF1u1tNzNZX237+0oivwjyP4CAmUxNKLeDM8dXr1hfR71xonW+7kduqihAjXd/TD0NrdJwRH2Jg6AcWw8Kuc+fI83znqeTnvuL7/o9P2AfgOzmf95WPyL675nslHf6Y689TaZkAmrNpW9vVthtaUFoNuFmfInVublh2/WzW68aEYafD2LFuqkEaR0enVFUOz1/Ex2R4ozcHf+cc6jy6NbdUh7hId3jAwfnztoXJm9fgPE8cHR2zXB6yXB62q7a5g4nuXFhBd3tVSjPk7PuEb4btzkGg+THmCbc1afdn9iWhkW77JiuwzVCdZcOu3133Xd8xLAYWiwUxxi3l7K7TNP3KLz3q3h+7D8B3cj7rgY9a3/zIpzzMH97meTksqCG0ZuHMe2bLoDaGS6XmCdoITVpHLFU53ayIXcto3nA0dR4nJnJar1ccr04Zlodm03YFS8e7YDtPBLID8SAB+oOe0CdzeHC+NSUzt956C12XODx3jr5PmKjPNkH5tnY54m3m3CzfVqtVKyFAteJD2wIJ5HFDnnPbLHDWAYQQiNGakeBN8xLawucYI4vFYI3RNmNiLrXDMDAMQ0MQ9OPw/jd+8Tvvc8d9AL6T8zXO6b0e8eT79Rdu9xN0hwjmXupd2KbDdh0b9FJqpRQaIFsaudOUbiEEqx1b59xCl5ILx8cnSFUWw6Kp62yTUhW74rd7UHzwdAcL+oMFi3NLYh8RBJ9ApXD56BI+RJaLA5aLvgVgIqWAYmaWxrQZyeNEzYX1eg0oXZeQul1lZm+r0xPmeWLokrGvaQ5fwduOkxhbt7ytEyEFv7M8iU3EH5ppqPPGhRwGy4ZWl/IxIvUlP//we71LEE3gQ+h80b2/8OWdk2scfFp00jZ4NqGTLVyyGk2aFHLnzqWMmw2CcnC4pOt6Qkg7EVTNhc36lBvf/na6rufcuXPGvHYB76PpTtqDDcmsQlwMpLbR08Z9gVILx0eXcc5z/vw5Dg6XbdRnDYJXM7ms2caKW//EOWd88CZSas2JrSQTpmmNiNJ1g4Hm3hOcBbIgu3pTGw/S6uStl2LE4Xc0tIbo43amnG25Y5u8qHJ7Vf30+97tjq960WvfeOs+AP/BefHLX12/7N6ff31M/Z2HlD4+Tyu7jlRRWnHImbpOtSIoeDhdr+j6jm6xxMd+p9AL2FLEo8uXWZ+uODh/gUW/QNqeZOdNk6xX2InErsMFz9BqKR88pWSOLl0GqZy/cMHqr2FozULDBUu9Ytlj0zLXAt6RrjBI2taG8zxTRM5sircuDI42F0/N/fVsQc/W57pLXVMgWlpU/46g3Vb6gFObo7udwP/DQe9138/42F9+0Wv/+mh/Bf+D8799+w/dtLj6Dk8J5665VcISCCYAd804sq1lkLaIsFRhnmZyKYR+QNS1DNF2IEtlnkcuHx0TB9tL52PXll63qYiD1NlVFlrADcNgD6Bd46enp8xl5vzFixwcHLBYLomd7UFxTpE8UbIxpm2Ztm1+mnPGeVvgY3NukCKsNxvGPO+Ml7ZbQEWt1nUu4H3Cu7D7fY03GS1gG2CtziY820bEwG0zjjcDTY8PRqjt+66p89KdQpd+40WP/MKP2QfgOzmf+4DHvHx03beGw4vHsl0JobrTFpeS2644m0TMueBTb1uSmrWbtpWvpVTW63F3zXkfqG3XyZZmFVrNtO06U0pnO0dUWa1WrFYrazgWC6vTgo3Paqnkqck5x5FcMnOezVNaBELAh4jIGaVrnEaKCDGdTVWMK2nduqiQgj/z29la1IUzq7rtLNlhL6LoneGBySxJjMu43aEnO+u7oe9ZLJekvr9jiunFL/nOL7rTPgDfyfmCb/r+n2N57mEsL9bqItICwuonfwVOqFR1dN1itybMsgZtBVhmtTIvwL6zGW6IkdQZ6TTEQPDxjNLvzlz1txOJW265mb7vWC6XNgHxYnvvVKllZhpnSq5sxolpNt8h9baEO8SuCeCVnIXNemqKu4GuGwihI4TUNngaGzxtMzQV2TLEr/DIoc2rG9TZUCTjOsYULfDa1/Q+MsSOoQHboSkIh2FB6LpPCSH+1C8+5ovvuA/Ad/bLL5bPi4tzD3H9uaK7ztiZ5FG3IPN2kU3cbcvUZhFcqtGz5pJtC1NKhC4Qe6NHdX1vUxPf6igafihn7JfLly8RY+Cqqy5aN+nNdaZ55VNLpcwzUwPBVWy1bEymDnQNl6zVOuFala5f7LQnvnnoiJytpcDrFRCUkQ1UdOs2bML98P+1d+2xmlXV/bf245zvu3ceMiIFJa21tU2tplXTqrXSRilq1YpSxSrj8IhBIjRFLATFoqBoFQsFAa0xGtRSQ6WAysNEwRq1sTbB2EaNTVq1tlQa53W/xzl777X6x1r73EtTEXCGmcGzkklm5mZyv3Nm3733+q3fQ+fHSsj1+mdLkXJEaGIYwruH4zdGTCydIMaApmkRYng6HG668fw/OPqnahZ8f+ur37ub7rnugjfm2a4/C7xodOarbOqSM9gB2QJvmtiYzpjVWF0I3doadu/cjdVV7VgrSBtig9YpCaKUHs7ToOOtu+BsNkPfd9iyZTPadmp8P42miOSQU0Y/X2LPrl2QpA1CtIUeW5tIGOk2JXVrnUymaFcmahNnZpwbd9/QNGAqcMac1r/XLOUQzVuR7BQw9WBdKvp9FHfMpsfOrCmowowkqlHpuk5pbEJISeWpXd99u+R87IvffuN3xwX4/9Tt7zn94rT3B+dxP49gNRknIhQL+3DOoWnVcYDJ7DYKY7Z7D0qfsLppFU3T6k9/0O63rZnEKIDNnQeZZymYz+c2a41o26ntsjo2IwZK32Pv7jX0yyWib+BDY+7+LZom6i5dgC5pYtN0OkXTtGgaDxdoyFtxlvIUg7Kwixhb3K3PlIPR1pg0PMcP0IoMO3/OonfQft1+sLAgmxd3IUIuwHw2U5tkAKXAUgiWWHb9V5xzr3ruBdf9608lDHNf9dHP/NMdrzzuaQvm8hwu2THubQ2sNHo7RmvCZ1KCQts2mLQTpTDFYNMGS0kyUfzglmDREzVXjlkG/h9RFUVp571cLFGKwAclpZL38KFBbCbqHcNA3yeQI0wmk/VphXXoel+1u5zBS0XYFH76DLkknQWbGk/s4lfF/IpOu8G0s0aSDbHKIjpCJGc2Jmog74NHsJg1cvpcwYfHEPmnvvrZT/nCtZ+964cAEMalt17tps2Xd1JS6vOlBA5SzcSJBn9BIlKHKiOSFhG0k4mmONmQXp0n1XCSnOXGYX3uXMXxtQMNg3lmsq/r17xzcJ5B0LsceYU+BITlskPOukvXxafSS0vvtI69cNGmwpKngg9w5MGS0C86UFAfbYYBzEwoRTNYyHwZlWcodhzrDl1KBjMhGDtHBIpJevW8zhnIpcDDgVy0lKmCbpmfWYocBeDbP/VNyP+t3/vj9+atT/zNKxBX3yaYJIGJvNm2Bqc5cErT0jHdyuoKgtmkVYN05dUtkUundm/WLVeyQN/3A+A7mUyso87IWWzH1SaoMOC9+lz76JUYEB36tBiCdahm1QEA6a5GTsmsdYGCgL5fGtziIChIOaFwQSAHLwSXCtBnlL7X2DQBnEDF76LEBs7Fcp7VqauJUSWgjkBQGCsIwTPgCQjeoY0ejfeIRIjeo23jW9s2fmm8A95HfeJr4vyNp16XFrteDl7CEes4zSuLRkpBl5eILmBlxVRuABrz6IPR2OsxO3gRWvad92Z4ZLBFyebiakAxm045kINQND2JgwcGahjEDcde27TGWtb7ZO2y667Y90s0TUSwBCoRAXmHvu/RBAW7uWqoAdWaeKdEiw05K5qdbAh7cIDBUQK95+WUARPLK1IKZPCGXR83B4STn/Cay3eOMMx91Am/RjzZ9uhTKG76IPmpTTXqf5CYh1+DprU5rfHlKplVEzNpOF7bttWRm43hapCiTl40srUU9arJOdvYzqCciQVwe2uInM6QYzuxe6btmjazVQLCOlFCGwZBIPUYzFkhF8lqiMRFc5FT1yPnrAMT0futZjkzKotyPbHKKX2taOTsRns8MJuS0Fsyqa/8yW+kvj974+Ibd8AfUze/43WbJc3/PC93nkFlAXIAoygzxGugYfBkLqZAIIYbtGkwhwVnDGpdxDFo/tuyW2pgTSUO2MU+xoh2qiAyWcKn3uFsB0W1YlNWjHcObWwtiBsmNFqPr+i6JZwDolOXhKHDtV3Sb5h6eK+gOZsTBDyhiS2IgFQUniLvN8yD1b9bGENzVSn7EAcmoChR9p5lSsc94dQr7xpxwAdYt1315k3zH/z7B3i580TnMhGpC78PQbu8yjZWR1KAWOlOdjSFEAb8T+yIzSzouh4xqHOVUuM1bLttJoix1Z1UAG8eN0SEnLLZS/RpAAAOMklEQVTNcckIFIAndcNK5iPTmtNqXdTz+V547zFtJsbzMwIuFKOrIHs0LXTO6wbtTRPhgjqG5ZxVrO8D2ABrMQcwLmIRtmasHoI5kAlySQmC4x93yhW3jJOQB1HPe93FayvbHnMaJptuFmrVSYD1nlZhlJzVdzqXDBJVoQkRfAwQAoqJwLvUmTAqW8yrR4hThNiquVBshzmxIzdkmKh2uBhVyo61qNEMIKC3yIaqpBO7cy0W8yH0Bo4H8gSzxkF0yw6BnOWXuGEOXuwYz0WjZnPu4RxQOAOcTT2tP2SpT+hTp9YlpJSt0iedOee+BHIXHvaoLbf+qPc77oD3sz55zbmr+Z7vX8X92g5fFmbjQSAoVNN4D+fEIr9gLgx6Ia/3JE30cnAU4Sio94xzRvLEgN2FGECikxMpPMA7jtS2YyC7MoNTP9xDaweMjanuADatrMJ7AEzgqh3pErgwNk9WEKet/pDkgj71INaUAReDOo2R8SRF4L1BQuSQSx5izVzFSEnt75JqrK9Nic74xdPf+yMT30cg+n7WdZ/+Ytr+omPuAHB4TvwUEta4VrvziAXOZKPpF9b4hQKFVXxsEEO0+5mRVb0H2SLU0awBvCzWHGgsQyULqKG5HsVcMjhnODuGhVnpU2K5KWK7lO2kGv4oIPOBqYKmtmkG4NkRkLoEZylM4ixfWQBvJAVPmiJfckK/XAJY/z4K/2gqKETuCkQnPfY1V90nJ3BcgA+g/vr2f+xOfemxn8/Mj2fuf6XkTG546T1SYZVqGmGg0puapkVsmnVhkmjYjLO0z2qaWQMPYTG0zjQbjhxKzsNxDNaFSIbT1YYD1tUGp1EWXNTtgUvR+1sl3TqnC7wUtG2juyoAyYxsY7ZgsBBEBn0L2JLi4cBF8U2d4Jg/Nwt6lTDsDM791tGnXf1jDS/HO+ADrOPO/Is9K0f/8sl++shPc9y0KOyQ+wJiMncsGENEMTkfw7rrAqkVHIx7d6+dwAQ/ZH40zGwjONu9WL2mOSXbbWVg1tTo2WR3NR0bOsstKUatUh2z2B22lKIdueiiVfC8H2bgXBicGQEOVASS2WCeBJGEVDRvTylqRs7VKcnOadu+8OjTrr77/rzPcQE+iHrujjfNNv3sk/5oZduRZ2O6ZRf5CVjHJLo7iENhAotKMJnUj4ZI57Te+QEsVmmjNhkp6aSEoOTPdYNNzQ/OfW+yDBn4ilXTzFBIpQLeKSezqFNKVf1+IgLO6sYaKajf4QZN9EZ7EldnwlwQUHdcgFNGDKTuYXaG5pxBcD0RvfmoHVd86f6+y3EBPsg69qRz1l5w9tXv96vbzvSbDp8hrpoFxjrUkllsrOaQwaoPoaAArTGkVTmnxpcpJXBRun81VZcNemUXTMUnlSirc+OcEqLpOyqPcT6bD1w9nTnbyK4IcteDiqCUZN+m2hLLwBtk0c9VQxEJqn8hhk1q1iEdrnERjt4HT3/1QN7jeAf8SZuTz3z169uPP/aL5F1bcn5SETVL96SjMvUcNMbxkGK0AchlhuSsccGmryDAYmehcEYx9doQU6ZAcemL7XAVx/PDIlosOkynk+F+BihuJ7lgPpsNWhEiIFn8RN/1EGEVnRveWMeFbLZyy+USZFOfai9H3kOcv3MynZz8yBMvfUBRsSMMsy9B6yvPfNd81w/fUPo5RTDa6MDkEMijOsU50DC1qLuNty6T/Prgv5JJsSGuy1WRU80+KWxs5YDWfFvqUbu2toYQHGJUevzwtU41JYN+pVgjYX7ZAmjak+GCsWkQvKrmKgEiTlr4GNCnjBgawNO3Ypw8e8sfXvKfD/SdjTvgPqwTXnHW5xrZXRjuN7hII1zAkgdNbeEMId2hquOC5tl5ixxb3/0UeFa7D5gbAZwaGZEFFOrR6uCdH8Z9OrMt6NISfdfpvzXDchE2k0rVNM/maxYVFoesPeU0ar5xpXHVO56wGp6TkRccOXjf/AcBJz7ixHd968G8s/EOuA/rJTu2F9m05ZJ2y8+c3W49PCNMwMWr04Ld78QYwmxTDbKjeiB8ihphVv9ChliSewEzAfAgF7X7NL0xq7xITTRLj5T7IT/ZOZ0N873GgYzZ2lzHeE3Ue6YRS6NJQcXcxMTSBSBAaCIkOFULikMIzZpAzj3sle/56oN9Z+MRvJ/q9g++5eTSzz7U7/wfoNuDIAWQVG0sELzpdQmITv1eSsmDGz9VTBB6h2uaqIwX0rlz8EBO/WAR4r0Hpzz0KKUoC7ttWzRNALOGbUufMZvPkHvB1kdsRjQfRPWDZsP1HFLq72XcGactXAi6a7sAkBMiuuxRJ112zk/ynsYjeD/VR2++865Xv+LFnwjer5RSApeyjZldpfhX2jyMYV0F6rkU65a9sVVU5um9xkrU7GONl4BCKuZlmJYdCic0TUCIXkmiQsgpwZPeOUvO2LtnL9rpFMGHQcnmNzC+izUlw52vaeCaaM2IWAwE3XzESZef+pO+p/EI3p944fbz/vl5Z7zzlNVfeOxTaTK9iqarYFJAmNiZcbpAhtsbafo5DLcDrBlYz7hLJSOXrPBNAWDxtOoToxgjkVfj9KLgNQqjpAwPUoesEDQ/JRAoKtW/GnJWz0RdfBqi3U5aBKPUQ+VYX8p9PmVfvKNxB3wI6trr7ygnvvhZn/PeCwv9DswGw7AYAKobKRvuXdXbmcjYNRUItnscDKB2oAHjI2iDUcO5U87grLJJb77POTF8ExHbaL6AEblkLLsOqU/D7lrz6yZTdXctrAJ2D/dNiNt+1ClXfndcgIdQffzWr5TtLz32y0ThbhH3dBGZQpTiX7FDkLPukpSFYguOSDtZJwS245uL6KzYedN5KFBN3pqEwpCuMyN0DeHWpkfdUF2o7gYeOWfMF3MUEXXGt8bFe68+hjzYG+8kojOO2HHFF/fVexmbkANQn7z87OPRrX1A+sXhlJdwUHikiZrjRiSQkuHJaFamJa75dRCBh7JjWh8AFDAXkDNrNdEF2i/nkKws7LjBOqNQQS4Jq6ub4L1Hzgmz2RxNE7EyWdFQUbvr9TmBgkfbTjN5d+GRO668ZF++i3EHPAB13W3/8M2TX3LcN1zw075bzIn50SR29KFaXNlOaMyWqoATU6lph6wWHigCEp3NKvVKIEWjXhvzqiG1TQUDWHQLMBdMVle0gTG5ZttOBgaMwi89ZrOZ4ohN+4GjTrnqvH39LsYm5EA1KK9756fc1iNfFVZWT3ArW24tfgJhbRyYCc5Z6qc1IGrjsk4UWMcNAXYEcYSSCVx/FVW3wUWIqMwzQdDlHvP5DLBJBwhwwaOZthto//qDUHUezrsb+n75+v3xHsYj+GDADK95w+YyW7ulrO35bVcSvCe00URGpKJwb/5/zAVkQdUqwCOQV+5ftKw7MEOKbFiwBU3TwgVB6nuk3GHT1s3YtHmzKdrMC6dPQGZMmgYQoOt7hOC/7kJ44WPP/PB398ezjzvgwbAbnnHp3q2PfvxxzebD7kQzhcChT0q3yqz7BAss2GajpbCxVszZKjOj2EFeyQ+lujtYw+0oYLKyiqadAuJMJectGWCOAvUPVMGS3F1KOWt/Lb5xAR5E9cxXnrOYHvFzL2sPO+JDmGzeWxCQsqAwkApsNgwLXBQwO/19FYY7DGIocaQL0azm1NlUjYzIq6DJOTe4wSZzW1Whu0MvjL7kLpfy1sefc93n9+dzj0fwQVZ//7FLm37XD16Y53veIYvZLyEneCfwxIPvjLdxnDKdiwqaFK+xXUVXJYmA2AgFdmkkp81KiMa2MZ/n3HVoY6O7rS72i5547vUX7u/nHXfAg6yOedUb+skjDv8710yf3GzaehliiyIYwmiERSn7EGXWQAYVWvUwqM7/BUA2FVxVrGlzocaaXddhsehRUtHICgxKvI80IV78UDzvuAMexHXHNedP8mLtsjRfO83lWXRcBv2vQ4CLApFsFrq6KwrLYDDpUAkOMIKsAtwCtdzIRT1pYggIMFcD4S8w+ISnnH/DPeMCHAvf/pcvx+997hNnSbf2ptStbUNKQ1KSIwFLNu9ms4YzSn/lG8IIsNXJwDsHKRlE2h374AFWXa8n/x0ivPzXz7/+Kw/V840L8FC5G15z7jHz2e5jeLbnOGJ5luqBBZBkZFSGs7R0bwQGkQLnwrp/jXMDc8YjD/R7IzJwgHvJUy+44eaH8rnGBXgoHckffoub/9f3jqTCfytp8YwIUf8+L3BUACkg2/i8X4dYdCFqzGotVcfl9fgt4j952ptv/MuH+pnGBXgI1mff97ZHLXd+53b0yydT6hAIEOn1XC6s0RBGqVe/NRM1WfwCYZ3epRFgeP+zLrrptQfiWcYu+BCs57z2gns2bzvq+TLdcmcOLboiSMVBigeLh8CjCNbp+gLkojPflBP6kiFuCOa+LYHPO1DPMi7AQxWuOf2i/5Z2uh2rWz6S2lUUN0GWAKaIzCqOz8xgArhqeEX/y6t2GM59Swivf/ZFn9x9oJ5jPIIP8frU1W9q+rU9JyH1F8hi/vMRBY4YnHt4X+CCmDOXgzMfGXPM7wXyvGPfctMdB/LzjwvwYVK3vveNW7u1XechdafLcrHNIwNI2iVrJChiCGoOo1ELO57/9luuPdCfe1yAD7O64V1n/b50iyupnz9O0kIdXC3rjURd/onKRS+4+FMXHgyfd7wDPszqpedeeQtPV05OzfSm7JrbMsLXCkKXGejV5uNvcqJ3Hyyfd9wBH6b1sUtOn7r5HvLMBEm/SjnfTlT+TSS96GXv/sz3xzc01kNaHz/3+Gdc/6cv+t3xTYw11lhjjTXWWGONNdZYY4011lhjjTXWWGONNdZYY4011lhjjTXWWA/r+l9AyYlrtHj7mwAAAABJRU5ErkJggg==';

	// Detects some browser capabilities. Only for internal use, not exposed to the
	// API user.

	// eventConstructors
	// `true` if the browser can run `new Event()`.
	// If `false`, then the library will resort to the (deprecated) `window.createEvent()`
	// and `event.initMouseEvent()`. This is needed for legacy browsers and PhantomJS.
	var eventConstructors = true;

	try {
		var foo = new Touch({ identifier: 0, target: document });
		// 	var foo = new MouseEvent();
	} catch (e) {
		eventConstructors = false;
	}

	// mouseEventConstructor, for MouseEvent
	var mouseEventConstructor = true;

	try {
		var foo = new MouseEvent('mousedown');
	} catch (e) {
		mouseEventConstructor = false;
	}

	// touchConstructor, for Touch
	var touchConstructor = true;

	try {
		var foo = new Touch({ identifier: 0, target: document });
	} catch (e) {
		touchConstructor = false;
	}

	// touchEventConstructor, for TouchEvent
	// Weirdly, Safari on iOS has Touch constructor but no TouchEvent constructor.
	var touchEventConstructor = true;

	try {
		var foo = new TouchEvent('touchdown');
	} catch (e) {
		touchEventConstructor = false;
	}

	// pointerEventConstructor, for PointerEvent
	var pointerEventConstructor = true;

	try {
		var foo = new PointerEvent('pointerdown');
	} catch (e) {
		pointerEventConstructor = false;
	}

	// mouse: `true` if the browser implements `MouseEvent`
	var mouse = !!('MouseEvent' in window);

	// touch: `true` if the browser implements `TouchEvent`
	var touch = !!('TouchEvent' in window);

	// pointer: `true` if the browser implements `PointerEvent`
	var pointer = !!('PointerEvent' in window);

	// Some bits borrowed from Leaflet's L.Browser

	var ua = navigator.userAgent.toLowerCase();
	var webkit = ua.indexOf('webkit') !== -1;
	var phantomjs = ua.indexOf('phantom') !== -1;
	var android23 = ua.search('android [23]') !== -1;
	var chrome = ua.indexOf('chrome') !== -1;
	var gecko = ua.indexOf('gecko') !== -1 && !webkit && !window.opera && !ie;
	var phantomjs = phantomjs;
	var ie = ie;
	var webkit = webkit;
	var gecko = gecko;
	var android = ua.indexOf('android') !== -1;
	var chrome = chrome;
	var safari = !chrome && !phantomjs && ua.indexOf('safari') !== -1;

	// Self-incrementing identifier for touch ID and pointer ID.
	// Fingers can either keep the same ID for their life, or request a new
	//   ID whenever they go down.
	var fingerIdSequence = 1;

	// 🖑class Finger
	// Represents a finger, capable of performing single touch/pointer/mouse synthetic
	// events.

	/*
	🖑example

	```js
	var h = new Hand();
	var fatFinger = h.growFinger('pointer', { pointerType: 'touch', pressure: 0.9 });
	var lightFinger = h.growFinger('pointer', { pointerType: 'touch', pressure: 0.1 });

	fatFinger.wait(500).moveTo(200, 250, 0).down().moveBy(100, 150, 2000).up();
	```

	*/

	var Finger = function () {

		// 🖑factory Finger(eventMode: String, options?: Finger state): Finger
		// Instantiates a new `Finger`. `eventMode` must be `mouse`, `touch` or `pointer`
		// for `MouseEvent`s, `TouchEvent`s or `PointerEvent`s, respectively.

		function Finger(eventMode, options) {
			babelHelpers.classCallCheck(this, Finger);


			this._id = fingerIdSequence++;

			this._mode = eventMode || 'mouse';

			this._hand = options.hand;

			/// TODO: parkinsonFactor or shakesFactor or jitteryness or something

			// 🖑section Finger state
			// The internal state of a `Finger` has options which will be reflected as
			// properties of the events fired afterwards. Some of these state options
			// apply only to a specific event mode.
			this._state = babelHelpers.extends({}, {
				// 🖑option x: Number; The number of pixels from the left boundary the finger is at.
				x: 0,

				// 🖑option y: Number; The number of pixels from the top boundary the finger is at.
				y: 0,

				// 🖑option down: Boolean; Whether the finger is down (clicking/touching/pressing) or not. This is referred to as "active" in some of the events specifications.
				down: false,

				// 🖑option pressure: Number = 0.5; The value for [`Touch.force`](`https://developer.mozilla.org/docs/Web/API/Touch/force`) or [`PointerEvent.pressure`](https://developer.mozilla.org/docs/Web/API/PointerEvent/pressure), between `0.0` and `1.0`
				pressure: 0.5,

				// 🖑option tiltX: Number = 0; The value for [`PointerEvent.tiltX`](https://developer.mozilla.org/docs/Web/API/PointerEvent/tiltX)
				tiltX: 0,

				// 🖑option tiltY: Number = 0; The value for [`PointerEvent.tiltX`](https://developer.mozilla.org/docs/Web/API/PointerEvent/tiltY)
				tiltY: 0,

				// 🖑option width: Number = 25; The value for [`Touch.radiusX`](`https://developer.mozilla.org/docs/Web/API/Touch/radiusX`) or [`PointerEvent.width`](https://developer.mozilla.org/docs/Web/API/PointerEvent/width)
				width: 25,

				// 🖑option radiusY: Number = 25; The value for [`Touch.radiusY`](`https://developer.mozilla.org/docs/Web/API/Touch/radiusY`) or [`PointerEvent.height`](https://developer.mozilla.org/docs/Web/API/PointerEvent/height)
				height: 25,

				// 🖑option pointerType: String = 'pen'; The value for [`PointerEvent.pointerType`](https://developer.mozilla.org/docs/Web/API/PointerEvent/pointerType)
				pointerType: 'pen'
			}, options);

			// A "finger movement" is a plain hashmap that describes either a
			// instantaneous state change (e.g. "touch down", "up/lift touch",
			// "change pressure") or a movement("move", "wiggle", "vary pressure
			// during a few seconds").
			// A finger movement has three things:
			// * A duration (can be zero)
			// * A final finger state
			// * A function that returns the finger state (run when the movement is
			//   still running, i.e. the end timestamp is not reached yet)
			// These are called duration, finalState and getState().
			// getState() gets called with an amount of milliseconds since the last movement
			// getState() might return `false`, meaning 'nothing happened since last time'

			this._movements = [];

			// Timestamp for the end of the last movement.
			this._movesUntil = performance.now();

			// Timestamp for the start of the current movement. This is always in the past.
			this._movesFrom = performance.now();

			// Final state of the last movement (to calculate the next movement if needed).
			this._finalState = babelHelpers.extends({}, this._state);

			// This should be configurable with custom/more graphics
			if (this._mode === 'touch') {
				this._initGraphicIvansFinger();
				if (!touch) {
					console.warn('This browser cannot emulate touch events.');
				}
			} else if (this._mode === 'pointer') {
				if (this._state.pointerType === 'touch') {
					this._initGraphicIvansFinger();
				} else {
					this._initGraphicCircle();
				}
				if (!pointer) {
					console.warn('This browser cannot emulate pointer events.');
				}
			} else {
				this._mode = 'mouse';
				this._initGraphicCircle();
				if (!mouse) {
					console.warn('This browser cannot emulate mouse events.');
				}
			}

			// Only used for `TouchEvent`s (as `Touch.target`): Will hold a
			// reference to the DOM element on which the touch point started when
			// it was first placed on the surface.
			this._touchTargetWhenDowned = undefined;

			// For checking mouseover/mouseout/pointerover/pointerout events, and
			// for checking whether a `Touch` should be in the `targetTouches` `TouchList`
			this._currentTarget = undefined;
		}

		// 🖑method isIdle(): Boolean
		// Returns true when the finger has no more pending movements/waits/wiggles/etc.


		babelHelpers.createClass(Finger, [{
			key: 'isIdle',
			value: function isIdle() {
				return !this._movements.length;
			}

			// 🖑method down(delay?: Number): this
			// Puts the finger down, optionally after a delay.

		}, {
			key: 'down',
			value: function down(delay) {
				return this.update({ down: true, getState: this._falseFn, duration: delay || 0 });
			}

			// 🖑method up(options?: {}): this
			// Lifts the finger up, after an optional delay.

		}, {
			key: 'up',
			value: function up(delay) {
				return this.update({ down: false, getState: this._falseFn, duration: delay || 0 });
			}

			// 🖑method wait(delay): this
			// Don't move this finger for `delay` milliseconds.

		}, {
			key: 'wait',
			value: function wait(delay) {
				this._queueMove({ finalState: this._finalState, getState: this._falseFn, duration: delay });
				return this;
			}

			// 🖑method waitUntil(timestamp): this
			// Don't move this finger until the given timestamp is reached.

		}, {
			key: 'waitUntil',
			value: function waitUntil(timestamp) {
				if (this._movements.length) {
					return this.wait(timestamp - this._movesUntil);
				} else {
					var move = {
						finalState: this._finalState,
						getState: this._falseFn,
						duration: timestamp - performance.now(),
						until: timestamp
					};
					this._movesUntil = this._movesFrom = move.until;
					this._movements.push(move);

					this._hand.fingerIsBusy();
				}
				return this;
			}

			// 🖑method update(options?: {}): this
			// Updates some of the finger options, like pressure or touch angle,
			// without disturbing its movement, after an optional delay.

		}, {
			key: 'update',
			value: function update(options, delay) {
				this._queueMove({ finalState: options, getState: this._falseFn, duration: delay || 0 });
				return this;
			}

			// 🖑method reset(options?: {}): this
			// Clears all the queued movements for this finger and immediately lifts it up

		}, {
			key: 'reset',
			value: function reset(options) {
				return this;
			}

			// 🖑method moveTo(x: Number, y: Number, delay: Number, options?: {}): this
			// Queues moving this finger to an absolute position at `(x, y)`; the
			// movement will last for `delay` milliseconds.

		}, {
			key: 'moveTo',
			value: function moveTo(x, y, delay) {
				return this.moveBy(x - this._finalState.x, y - this._finalState.y, delay);
			}

			// 🖑method moveBy(x: Number, y: Number, delay: Number, options?: {}): this
			// Queues a move of this finger to an position relative to its last position
			// plus`(x, y)`; the movement will last for `delay` milliseconds.

		}, {
			key: 'moveBy',
			value: function moveBy(x, y, delay) {
				var fromX = this._finalState.x;
				var fromY = this._finalState.y;

				var move = {
					finalState: {
						x: fromX + x,
						y: fromY + y
					},

					getState: function (x1, y1, dx, dy) {
						return function (msec) {
							var percent = msec / delay;
							return {
								x: Math.round(x1 + dx * percent),
								y: Math.round(y1 + dy * percent)
							};
						};
					}(fromX, fromY, x, y, delay),

					duration: delay
					// 			until: this._movesUntil + delay
				};

				this._queueMove(move);

				return this;
			}

			// An aux function that always returns false

		}, {
			key: '_falseFn',
			value: function _falseFn() {
				return false;
			}

			// Queues a movement

		}, {
			key: '_queueMove',
			value: function _queueMove(move) {

				if (!this._movements.length) {
					this._movesUntil = this._movesFrom = performance.now();
				}

				move.until = this._movesUntil + move.duration;
				this._movements.push(move);

				this._finalState = move.finalState = babelHelpers.extends({}, this._finalState, move.finalState);

				this._movesUntil = move.until;

				if (this._movements.length === 1) {
					this._hand.fingerIsBusy();
				}
			}

			// Returns the timestamp when the next movement will be finished
			// 🖑method getNextMoveEndTime(): Number|undefined

		}, {
			key: 'getNextMoveEndTime',
			value: function getNextMoveEndTime() {
				if (!this._movements.length) {
					return undefined;
				}
				return this._movements[0].until;
			}

			/*
	   * 🖑method getEvents(timestamp?: Number, justOne: Boolean): []
	   * Updates the private properties of the finger (x, y, timestamp) by
	   * running the next movement(s) as far as indicated by the timestamp (or
	   * as fas as to `performance.now()`), then checks if the state has changed
	   * and means an event should be fired.
	   *
	   * If `justOne` is set to truthy, then this will run just one movements.
	   * Otherwise, it will run as many movements as needed until `timestamp` is reached.
	   *
	   * Returns an array of objects of the form `{type: 'foo', event: MouseEvent(...), finger: Finger}`
	   * or `{type: 'foo', touch: Touch(...), finger: Finger}`, with all the active `Touch`es or
	   * all triggered mouse/pointer events triggered by executing moves until
	   * `timestamp`.
	   *
	   * If the finger doesn't matter when `getEvents()` is called, then an empty
	   * array is return instead. This happens for mice not moving, and fingers
	   * not touching (fingers touching but not moving, and mice not pressing
	   * but moving *do* matter).
	   *
	   * A `Hand` is reponsible for getting events (using loops, timings, or
	   * whatever), requesting the right timestamps if needed, merging `Touch`es
	   * into `TouchEvent`s, and firing the events via `dispatchEvent()`.
	  */

		}, {
			key: 'getEvents',
			value: function getEvents(timestamp, justOne) {
				var now = timestamp || performance.now();
				var changed = false;
				var previousState = babelHelpers.extends({}, this._state);
				// Process all moves that already happened (since last frame)
				while (this._movements.length && this._movements[0].until <= now && !(changed && justOne)) {
					var done = this._movements.shift();
					babelHelpers.extends(this._state, done.finalState);
					this._movesFrom = done.until;
					changed = true;
				}

				// Process ongoing movement
				if (this._movements.length && !(changed && justOne)) {
					var move = this._movements[0];

					var updatedState = move.getState(now - this._movesFrom);

					if (updatedState && !this._statesAreEqual(updatedState, this._state)) {
						changed = true;
						babelHelpers.extends(this._state, updatedState);
					}
				}

				if (!this._movements.length) {
					this._hand.fingerIsIdle();
				}

				// 		// TODO: Add jitter if needed

				var evType = 'idle';

				if (changed) {

					if (previousState.x !== this._state.x || previousState.y !== this._state.y) {
						evType = 'move';
						this._currentTarget = document.elementFromPoint(this._state.x, this._state.y);
					}
					/// TODO: Detect over/out events when the event target changes.

					if (previousState.down && !this._state.down) {
						this._graphic.style.display = 'none';
						evType = 'up';
					} else if (!previousState.down && this._state.down) {
						// TODO: Optionally reset the finger ID and grab a fresh one

						this._graphic.style.display = 'block';
						this._touchTargetWhenDowned = this._currentTarget = document.elementFromPoint(this._state.x, this._state.y);
						evType = 'down';
					}

					this._setGraphicPosition(this._state.x, this._state.y);
				}

				// `MouseEvent`s
				if (this._mode === 'mouse' || this._mode === 'touchpad') {
					if (evType === 'idle') {
						return [];
					}
					/// TODO: Check for mouseover/mouseout events, add them to the
					/// array.
					/// TODO: Create synthetic `click` and `dblclick` events if/when
					/// needed, add them to the array.
					return [{ type: evType, event: this._asMouseEvent(evType), finger: this }];
				}

				// `PointerEvent`s
				if (this._mode === 'pointer') {
					if (evType === 'idle') {
						return [];
					}
					/// TODO: Check for pointerover/pointerout events, add them to the
					/// array.
					/// TODO: Create synthetic `click` and `dblclick` events if/when
					/// needed, add them to the array.
					return [{ type: evType, event: this._asPointerEvent(evType), finger: this }];
				}

				// `Touch`es
				if (this._mode === 'touch') {
					if (this._touchTargetWhenDowned) {

						var ret = [{ type: evType, touch: this._asTouch(evType), finger: this }];
						if (evType === 'up') {
							this._touchTargetWhenDowned = undefined;
						}

						return ret;
					} else {
						return [];
					}
				}

				return [];
			}

			// 🖑method private_asTouch(): Touch
			// Returns an instance of `Touch` representing the current state of the finger
			// Note this is not an event - a `TouchEvent` must be created later, with several
			// `Touch`es.

		}, {
			key: '_asTouch',
			value: function _asTouch() {
				var touch;
				if (touchConstructor && !safari) {
					touch = new Touch({
						identifier: this._id,
						target: this._touchTargetWhenDowned,
						clientX: this._state.x,
						clientY: this._state.y,
						screenX: this._state.x, /// TODO: Handle page scrolling
						screenY: this._state.y,
						pageX: this._state.x,
						pageY: this._state.y,
						radiusX: 25,
						radiusY: 25,
						rotationAngle: 0,
						force: this._state.pressure
					});
				} else {

					if (chrome) {
						touch = document.createTouch(window, // view
						this._touchTargetWhenDowned, // target
						this._id, // identifier
						this._state.x, // clientX
						this._state.y, // clientY
						this._state.x, // screenX
						this._state.y, // screenY

						// Inconsistency: These break anything other than chrome:
						25, // radiusX
						25, // radiusY
						0, // rotationAngle
						this._state.pressure // force
						);
					} else if (gecko) {
							touch = document.createTouch(window, // view
							this._touchTargetWhenDowned, // target
							this._id, // identifier
							this._state.x, // clientX
							this._state.y, // clientY
							this._state.x, // screenX
							this._state.y, // screenY

							// Inconsistency: these are needed in Firefox
							this._state.x, // pageX
							this._state.y // pageY
							);
						} else {
								touch = document.createTouch(window, // view
								this._touchTargetWhenDowned, // target
								this._id, // identifier
								this._state.x, // clientX
								this._state.y, // clientY
								this._state.x, // screenX
								this._state.y // screenY
								);
							}
				}
				return touch;
			}

			// 🖑method private_asPointerEvent(): PointerEvent
			// Returns an instance of `PointerEvent` representing the current state of the finger

		}, {
			key: '_asPointerEvent',
			value: function _asPointerEvent(evType) {
				var ev = new PointerEvent('pointer' + evType, {
					bubbles: true,
					button: 0, // Moz doesn't use -1 when no buttons are pressed, WTF?
					// 			buttons: this._state.down ? 1 : 0,
					// 			detail: (evType === 'down' || evType === 'up') ? 1 : 0,	// TODO: count consecutive clicks
					clientX: this._state.x,
					clientY: this._state.y,
					screenX: this._state.x, /// TODO: Handle page scrolling
					screenY: this._state.y,
					pageX: this._state.x,
					pageY: this._state.y,
					pointerType: 'pen',
					pointerId: this._id,
					isPrimary: this._id === 1,
					width: this._state.width,
					height: this._state.height,
					tiltX: this._state.tiltX,
					tiltY: this._state.tiltY,
					pressure: this._state.pressure
					// 			target: document.elementFromPoint(this._state.x, this._state.y),	// works with viewport coords
				});
				return ev;
			}

			// 🖑method private_asMouseEvent(evType: String): PointerEvent
			// Returns an instance of `PointerEvent` representing the current state of the finger

		}, {
			key: '_asMouseEvent',
			value: function _asMouseEvent(evType) {
				var ev;
				if (mouseEventConstructor) {
					ev = new MouseEvent('mouse' + evType, {
						bubbles: true,
						button: 0, // Moz doesn't use -1 when no buttons are pressed, WTF?
						buttons: this._state.down ? 1 : 0,
						detail: evType === 'down' || evType === 'up' ? 1 : 0, // TODO: count consecutive clicks
						clientX: this._state.x,
						clientY: this._state.y,
						screenX: this._state.x, /// TODO: Handle page scrolling
						screenY: this._state.y,
						pageX: this._state.x,
						pageY: this._state.y
					});
				} else // 			target: document.elementFromPoint(this._state.x, this._state.y),	// works with viewport coords
					{
						// For legacy browsers and PhantomJS
						ev = document.createEvent('MouseEvent');
						ev.initMouseEvent('mouse' + evType, // Type
						true, // canBubble
						true, // cancellable
						window, // view
						0, // detail
						this._state.x, // screenX
						this._state.y, // screenY
						this._state.x, // clientX
						this._state.y, // clientY
						false, // ctrlKey
						false, // altKey
						false, // shiftKey
						false, // metaKey
						0, // button
						null // relatedTarget
						);
					}
				return ev;
			}

			// Inits this._graphic to be a SVG circle.

		}, {
			key: '_initGraphicCircle',
			value: function _initGraphicCircle() {

				this._graphic = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
				this._graphic.style.height = '50px';
				this._graphic.style.width = '50px';
				this._graphic.style.zIndex = 1000000; // Some ridiculously high value
				this._graphic.style.position = 'absolute';
				this._graphic.style.top = 0;
				this._graphic.style.left = 0;
				this._graphic.style.marginLeft = '-25px';
				this._graphic.style.marginTop = '-25px';
				this._graphic.style.pointerEvents = 'none';

				var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
				circle.cx.baseVal.value = 25;
				circle.cy.baseVal.value = 25;
				circle.r.baseVal.value = 20;
				circle.style.stroke = 'rgba(0,0,0,0.3)';
				circle.style.strokeWidth = 2;
				circle.style.fill = 'rgba(0,0,0,0.1)';

				this._graphic.appendChild(circle);

				this._graphic.style.display = 'none';
				document.body.appendChild(this._graphic);
			}

			// Inits this._graphic to be an image of Ivan's index finger

		}, {
			key: '_initGraphicIvansFinger',
			value: function _initGraphicIvansFinger() {

				this._graphic = document.createElement('img');
				this._graphic.src = IvansFinger;
				this._graphic.style.height = '160px';
				this._graphic.style.width = '160px';
				this._graphic.style.zIndex = 1000000; // Some ridiculously high value
				this._graphic.style.position = 'absolute';
				this._graphic.style.top = 0;
				this._graphic.style.left = 0;
				this._graphic.style.marginLeft = '-20px';
				this._graphic.style.marginTop = '-20px';
				this._graphic.style.pointerEvents = 'none';

				this._graphic.style.display = 'none';
				document.body.appendChild(this._graphic);
			}
		}, {
			key: '_setGraphicPosition',
			value: function _setGraphicPosition(x, y) {
				// Borrowed from Leaflet code
				this._graphic.style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0)';
			}

			// Simple, non-deep comparison of hashmaps, used for comparing internal finger states.
			// Returns `false` when one of the properties of s1 differs from the same property
			// of s2 (or s2 doesn't have it). It ignores if s1 doesn't have all properties from
			// s2.

		}, {
			key: '_statesAreEqual',
			value: function _statesAreEqual(s1, s2) {
				for (var i in s1) {
					if (s1[i] !== s2[i]) {
						return false;
					}
				}
				return true;
			}
		}]);
		return Finger;
	}();

	// Exports a bunch of symbols^H^H^H^H^H ints for use as enums

	var INTERVAL = 1;
	var MINIMAL = 2;
	var INSTANT = 3;
	var FRAME = 4;
	var FASTFRAME = 5;

	// export var INTERVAL = new Symbol();
	// export var MINIMAL = new Symbol();
	// export var INSTANT = new Symbol();
	//

	// 🖑class Hand
	// Represents a set of `Finger`s, capable of performing synthetic touch gestures

	/*
	🖑example

	```js
	var h = new Hand({ timing: '20ms' });
	```

	*/

	var Hand = function () {

		// 🖑factory Hand(options?: Hand options): Hand
		// Instantiates a new `Hand` with the given options.

		function Hand(options) {
			babelHelpers.classCallCheck(this, Hand);


			if (!options) {
				options = {};
			}

			this._fingers = [];

			this._fingersAreIdle = true;

			/// TODO: Timing modes: minimal, interval, frames

			// 🖑option timing: Timing= '20ms'
			// Defines how often new events will be fired, in one of the possible
			// timing modes

			// 🖑miniclass Timing (Hand)
			this._timeInterval = 20;
			this._timingMode = INTERVAL;
			this._framesPending = 0;
			if (options.timing) {
				var timing = options.timing.toString();

				// 🖑option ms
				// Preceded by a number (e.g. `'20ms'`), this mode triggers an event
				// dispatch every that many milliseconds.
				if (timing.match(/^\d+ms$/)) {
					this._timingMode = INTERVAL;
					this._timeInterval = parseInt(timing);
				}

				// 🖑option frame
				// This mode dispatches an event every [animation frame](https://developer.mozilla.org/docs/Web/API/Window/requestAnimationFrame).
				if (timing === 'frame') {
					this._timingMode = FRAME;
					this._timeInterval = parseInt(timing);
				}

				// 🖑option minimal
				// This mode triggers an event dispatch per finger change, and ensures
				// that every move can trigger its own event (no two movements will be
				// rolled into one event if they are very close).
				if (timing === 'minimal') {
					this._timingMode = MINIMAL;
					this._timeInterval = false;
				}

				// 🖑option instant
				// Like the `minimal` mode, but ignores timings completely and dispatches
				// all events instantaneously. This might cause misbehaviour in graphical
				// browsers, and the `onStart` and `onStop` callbacks will be called at.
				// every step of the movement (as the movement ends before the next step
				// is chained in)
				if (timing === 'instant') {
					this._timingMode = INSTANT;
					this._timeInterval = false;
				}

				// 🖑option fastframe
				// This mode ignores timings completely like the `instant` mode, and
				// dispatches a new event every so many frames.
				if (timing === 'fastframe') {
					this._timingMode = FASTFRAME;
					this._timeInterval = parseInt(timing);
				}
			}

			// 🖑class Hand

			// 🖑option onStart: Function
			// If set to a callback function, it will be called (with the `Hand`
			// as its only argument) whenever the movements start.
			if (options.onStart) {
				this._onStart = options.onStart;
			}

			// 🖑option onStop: Function
			// If set to a callback function, it will be called (with the `Hand`
			// as its only argument) whenever the movements are completed.
			if (options.onStop) {
				this._onStop = options.onStop;
			}

			// Cancellable reference to the next call to `_dispatchEvents`. This
			// might be either a `setTimeout` reference or a `requestAnimationFrame`
			// reference.
			this._nextDispatch = null;
		}

		// 🖑method growFinger(eventMode, options): Finger
		// Creates a new `Finger` with the same parameters as the [`Finger` constructor](#finger-finger),
		// and adds it to the hand.


		babelHelpers.createClass(Hand, [{
			key: 'growFinger',
			value: function growFinger(fingerMode, options) {

				if (!options) {
					options = {};
				}
				babelHelpers.extends(options, { hand: this });

				var finger = new Finger(fingerMode, options);

				this._fingers.push(finger);
				return finger;
			}

			// 🖑method fingerIsBusy(): this
			// Used by this hand's fingers to signal that there are movements to be
			// performed by at least one finger.

		}, {
			key: 'fingerIsBusy',
			value: function fingerIsBusy() {

				/// TODO: Start up the event loop

				if (this._fingersAreIdle) {
					// 🖑section
					// Use `document.addEventListener('prostheticHandStop', fn)` to
					// do stuff with it.
					// 🖑event prostheticHandStart: CustomEvent
					// Fired when all movements are complete.
					document.dispatchEvent(new CustomEvent('prostheticHandStart', { target: this }));

					if (this._onStart && this._onStart instanceof Function) {
						this._onStart(this);
					}

					this._fingersAreIdle = false;
					this._scheduleNextDispatch();
				}

				return this;
			}

			// 🖑method fingerIsIdle(): this
			// Used by this hand's fingers to signal that one finger has finished doing
			// all the queued movements.

		}, {
			key: 'fingerIsIdle',
			value: function fingerIsIdle() {

				if (this._fingers.every(function (f) {
					return f.isIdle();
				})) {

					if (!this._fingersAreIdle) {
						// 🖑event prostheticHandStop: CustomEvent
						// Fired when all movements are complete.

						document.dispatchEvent(new CustomEvent('prostheticHandStop', { target: this }));

						if (this._onStop && this._onStop instanceof Function) {
							this._onStop(this);
						}
					}

					this._fingersAreIdle = true;
				}
			}

			// 🖑method sync(delay): this
			// Synchronizes the finger movements by adding a delay of **at least** `delay`
			// milliseconds to each finger. After a sync, the movements of the fingers
			// will happen at exactly the same time.

		}, {
			key: 'sync',
			value: function sync(delay) {

				var endTimestamp = performance.now();

				this._fingers.forEach(function (f) {
					var movesUntil = f._movesUntil;
					if (movesUntil) {
						endTimestamp = Math.max(endTimestamp, movesUntil);
					}
				});

				var waitUntil = endTimestamp + delay;

				this._fingers.forEach(function (f) {
					f.waitUntil(waitUntil);
				});
			}

			// 🖑method private_dispatchEvents(): this
			// Updates all the fingers, fetching their events/touchpoints, and dispatches
			// all `Event`s triggered by the update.
			// This is meant to be called on an internal timer.

		}, {
			key: '_dispatchEvents',
			value: function _dispatchEvents(timestamp) {

				// 🖑event prostheticHandTick: CustomEvent
				// Fired a movement is about to start, just before the mouse/touch/pointer
				// events are fired.
				document.dispatchEvent(new CustomEvent('prostheticHandStart', { target: this }));

				var now = timestamp || performance.now();
				var events = [];
				var touches = [];
				var changedTouches = [];

				var hasTouchStart = false;
				var touchStartTarget = undefined;
				var hasTouchEnd = false;
				var touchEndTarget = undefined;

				var fast = this._timingMode === MINIMAL || this._timingMode === INSTANT || this._timingMode === FASTFRAME;

				this._fingers.forEach(function (f) {

					var evs = f.getEvents(now, fast);

					evs.forEach(function (ev) {
						if ('event' in ev) {
							events.push(ev.event);
						}
						if ('touch' in ev) {
							if (ev.type === 'down') {
								hasTouchStart = true;
								touchStartTarget = ev.touch.target;
								// If several touches start in the same instant at
								// the diffetent targets, this code will instead
								// assume the last target.
							}

							if (ev.type === 'up') {
								hasTouchEnd = true;
								touchEndTarget = ev.touch.target;
							} else {
								// Touches which have just been lost must not be added
								// to 'touches' or 'targetTouches'
								touches.push(ev.touch);
							}

							if (ev.type !== 'idle') {
								changedTouches.push(ev.touch);
							}
						}
					});
				});

				// Fire all `MouseEvent`s and `PointerEvent`s
				events.forEach(function (ev) {
					// 			console.log('Dispatching: ', ev.type);
					document.elementFromPoint(ev.clientX, ev.clientY).dispatchEvent(ev);
				});

				/// Build *ONE* `TouchEvent` with `TouchList`s built with
				/// the fingers' touches.
				if (touches.length || hasTouchEnd) {
					var touchEvent;
					var touchTarget;

					if (hasTouchStart) {
						// In case touches are added and removed on the same instant,
						// `touchstart` takes precedence.

						touchEvent = this._createTouchEvent("touchstart", {
							cancelable: true,
							bubbles: true,
							touches: touches,
							targetTouches: touches.filter(function (t) {
								return t.target === touchStartTarget;
							}),
							changedTouches: changedTouches
						});
						touchTarget = touchStartTarget;
						// console.log('synthesizing touchstart', touchStartTarget, touchEvent);
					} else if (hasTouchEnd) {

							// This goes directly against the specifications!! They say:
							// «touchend: The event's target is the same element that received
							// the touchstart event corresponding to the touch point, even
							// if the touch point has moved outside that element.»
							touchEndTarget = document.elementFromPoint(changedTouches[0].clientX, changedTouches[0].clientY);

							touchEvent = this._createTouchEvent("touchend", {
								cancelable: true,
								bubbles: true,
								touches: touches,
								target: touchEndTarget,
								targetTouches: touches.filter(function (t) {
									return t.target === touchEndTarget;
								}),
								changedTouches: changedTouches
							});
							touchTarget = touchEndTarget;
							// console.log('synthesizing touchend', touchEndTarget, touchEvent);
						} else {

								// I have no idea what I'm doing!!!!1
								// Apparently dispatching a touch event to the target of a touch
								// will not work.
								// 				touchTarget = touches[0].target;
								touchTarget = document.elementFromPoint(touches[0].clientX, touches[0].clientY);

								touchEvent = this._createTouchEvent("touchmove", {
									cancelable: true,
									bubbles: true,
									touches: touches,
									targetTouches: touches.filter(function (t) {
										return t.target === touchTarget;
									}),
									changedTouches: changedTouches
								});
							}

					if (changedTouches.length) {
						// console.log('Dispatching touch event:', touchEvent.type, touchEvent, touchTarget);

						// Safari misbehaves when searching for the elementFromPoint(0, 0)
						// and returns `undefined` instead of `document`
						if (!touchTarget) {
							touchTarget = document;
						}

						touchTarget.dispatchEvent(touchEvent);
					}
				}

				this._scheduleNextDispatch();

				return this;
			}

			// Wrapper over `new Event()` or `createEvent(); initTouchEvent()` depending
			// on what the browser supports.

		}, {
			key: '_createTouchEvent',
			value: function _createTouchEvent(type, data) {
				if (touchEventConstructor) {
					return new TouchEvent(type, data);
				} else {
					// It's ugly, it's legacy, but it should work.
					// See https://miketaylr.com/posts/2015/09/init-touch-event-is-a-rats-nest.html

					var touchEvent;
					try {
						touchEvent = document.createEvent('TouchEvent');
					} catch (e) {
						touchEvent = document.createEvent('UIEvent');
					}

					if (touchEvent && touchEvent.initTouchEvent) {
						if (touchEvent.initTouchEvent.length == 0 && !safari) {
							// Chrome
							touchEvent.initTouchEvent(this._createTouchListFromArray(data.touches), this._createTouchListFromArray(data.targetTouches), this._createTouchListFromArray(data.changedTouches), type, window, 0, // screenX
							0, // screenY
							0, // clientX
							0 // clientY
							);
						} else if (touchEvent.initTouchEvent.length == 12) {
								//firefox
								touchEvent.initTouchEvent(type, data.bubbles, data.cancelable, window, data.detail, data.ctrlKey, data.altKey, data.shiftKey, data.metaKey, this._createTouchListFromArray(data.touches), this._createTouchListFromArray(data.targetTouches), this._createTouchListFromArray(data.changedTouches));
							} else {
								// Safari (length = 18, shows 0)
								// https://developer.apple.com/library/safari/documentation/UserExperience/Reference/TouchEventClassReference/index.html#//apple_ref/javascript/instm/TouchEvent/initTouchEvent
								touchEvent.initTouchEvent(type, data.bubbles, data.cancelable, window, data.detail, 0, // screenX,
								0, // screenY,
								0, // pageX,
								0, // pageY,
								data.ctrlKey, data.altKey, data.shiftKey, data.metaKey, this._createTouchListFromArray(data.touches), this._createTouchListFromArray(data.targetTouches), this._createTouchListFromArray(data.changedTouches), 1, // data.scale,	- as factor of initial distance between the two first touches
								0 // data.rotation	- as delta of angle of two first touches
								);
							}
					}
					return touchEvent;
				}
			}

			// Stupid wrapper over document.createTouchList, because PhantomJS
			// doesn't like document.createTouchList.apply. I know this is a hack.
			// **Hopefully** nobody needs more than 8 fingers at the same time in PhantomJS.

		}, {
			key: '_createTouchListFromArray',
			value: function _createTouchListFromArray(touches) {
				switch (touches.length) {
					case 0:
						return document.createTouchList();
					case 1:
						return document.createTouchList(touches[0]);
					case 2:
						return document.createTouchList(touches[0], touches[1]);
					case 3:
						return document.createTouchList(touches[0], touches[1], touches[2]);
					case 4:
						return document.createTouchList(touches[0], touches[1], touches[2], touches[3]);
					case 5:
						return document.createTouchList(touches[0], touches[1], touches[2], touches[3], touches[4]);
					case 6:
						return document.createTouchList(touches[0], touches[1], touches[2], touches[3], touches[4], touches[5]);
					case 7:
						return document.createTouchList(touches[0], touches[1], touches[2], touches[3], touches[4], touches[5], touches[6]);
					default:
						return document.createTouchList(touches[0], touches[1], touches[2], touches[3], touches[4], touches[5], touches[6], touches[7]);
				}
			}
		}, {
			key: '_scheduleNextDispatch',
			value: function _scheduleNextDispatch() {
				if (!this._fingersAreIdle) {

					// Calculate time for next movement end. Could be refactored out for
					// some timing modes.
					var min = Infinity;
					this._fingers.forEach(function (f) {
						if (!f.isIdle()) {
							var next = f.getNextMoveEndTime();
							// 						console.log('next:', next);
							if (next < min) {
								min = next;
							}
						}
					});

					if (this._timingMode === INTERVAL) {
						this._nextDispatch = setTimeout(this._dispatchEvents.bind(this), this._timeInterval);
					} else if (this._timingMode === MINIMAL) {
						this._nextDispatch = setTimeout(this._dispatchEvents.bind(this), min - performance.now());
					} else if (this._timingMode === INSTANT) {
						return this._dispatchEvents(min);
					} else if (this._timingMode === FRAME) {
						this._nextDispatch = requestAnimationFrame(this._dispatchEvents.bind(this));
					} else if (this._timingMode === FASTFRAME) {
						this._nextDispatch = requestAnimationFrame(function () {
							this._dispatchEvents(min);
						}.bind(this));
					}
				}
			}
		}]);
		return Hand;
	}();

	return Hand;

}));
//# sourceMappingURL=prosthetic-hand.js.map