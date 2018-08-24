/*
 * Leaflet.draw assumes that you have already included the Leaflet library.
 */

L.drawVersion = '0.3.0-dev';

L.drawLocal = {
	draw: {
		toolbar: {
			// #TODO: this should be reorganized where actions are nested in actions
			// ex: actions.undo  or actions.cancel
			actions: {
				title: 'Annuler dessin',
				text: 'Annuler'
			},
			finish: {
				title: 'Terminer dessin',
				text: 'Terminer'
			},
			undo: {
				title: 'Supprimer dernier point dessiné',
				text: 'Supprimer dernier point'
			},
			buttons: {
				polyline: 'Ajouter une limite',
				polygon: 'Ajouter un Polygon',
				rectangle: 'Ajouter un Rectangle',
				circle: 'Ajouter un Cercle',
				marker: 'Ajouter un point'
			}
		},
		handlers: {
			circle: {
				tooltip: {
					start: 'Click and drag to draw circle.'
				},
				radius: 'Radius'
			},
			marker: {
				tooltip: {
					start: 'Pointez sur la carte pour collecter un Point.'
				}
			},
			polygon: {
				tooltip: {
					start: 'Pointez sur le 1er Point.',
					cont: 'Continuez à dessiner votre parcelle .',
					end: 'Double-cliquer pour fermer la parcelle.'
				}
			},
			polyline: {
				error: '<strong>Error:</strong> shape edges cannot cross!',
				tooltip: {
					start: 'Pointez sur la carte pour collecter votre ligne.',
					cont: 'Continuez à dessiner votre ligne.',
					end: 'Marquez le dernier Point de votre ligne.'
				}
			},
			rectangle: {
				tooltip: {
					start: 'Click and drag to draw rectangle.'
				}
			},
			simpleshape: {
				tooltip: {
					end: 'Release mouse to finish drawing.'
				}
			}
		}
	},
	edit: {
		toolbar: {
			actions: {
				save: {
					title: 'Enregistrer les changements.',
					text: 'Enregistrer'
				},
				cancel: {
					title: 'Annuler tous les changements.',
					text: 'Annuler'
				}
			},
			buttons: {
				edit: 'Modifier un élément.',
				editDisabled: 'Pas d\'élément à modifier.',
				remove: 'Supprimer un élément.',
				removeDisabled: 'Pas d\'élément à supprimer.'
			}
		},
		handlers: {
			edit: {
				tooltip: {
					text: 'Glissez l\'élément à modifier.'
					// subtext: 'Cliquez sur annuler.'
				}
			},
			remove: {
				tooltip: {
					text: 'Cliquez sur l\'élément à supprimer'
				}
			}
		}
	}
};
