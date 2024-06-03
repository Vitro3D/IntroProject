// custom-listbox.js
// A custom Vue component of a simple listbox. For whetever reason, Buefy does not supply one.
// example of use: 
// <cp-listbox :items=availableTemplates :selected=selectedTemplate style="width: 220px; height: 250px" @change="onTemplateSelectChange"></cp-listbox>
// items			string[]		The items that will appear in the listbox
// selected		string		The currently selected item
// @change		function		Called when the selected item has changed.


export default {

	name: 'CustomListbox',
	props: {
		width:		{ type: Number, require: false, default: 220 }, // With of the box in pixels
		items:		{ type: Array /* string[] */, required: true },	// The strings to display in the listbox.
		selected:	{ type: String, require: false }		// When changed the selected item in the listbox will change. This is not modified within the control.
	},
	computed: {
				
	},
	data() {
		return {
			activeItem: ''	
		}
	},
	template: `
		<div :style="'{ width: ' + width + 'px }'" style="height: 240px; overflow-y: scroll; overflow-x: hidden; border: solid grey 1px" >
			<table style="cursor: pointer; user-select: none; width:100%" >
				<tr v-for="(item, index) in items" 
					:style="{ backgroundColor: (activeItem == item ? '#2f89f7' : '#FFFFFF') }"
					@click="activeItem=item">
					<td style='padding-left: 4px; padding-bottom: 4px;' :title="item">{{ item }}</td>
				</tr>
			</table>
		</div>`,
	watch: {
		selected: {
			handler (val, oldVal) {
				if (val == oldVal)
					return;
				this.activeItem = this.selected;
			}
		},
		activeItem: {
			handler (val, oldVal) {
				if (val !== oldVal)	
					this.$emit('change', this.activeItem);
			}
		}
	}
	
};