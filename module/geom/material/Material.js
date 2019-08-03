import {ShaderMaterial} from "three";

/**
 * 材料类
 */
class Material extends ShaderMaterial {
    setUniformsValue(name, value){
        if (!this.uniforms[name]) {
            return;
        }
        this.uniforms[name].value = value;
        this.uniforms.needsUpdate = true;
    }

    setDefinesvalue(name, value) {
        this.defines[name] = value;
        this.needsUpdate = true;
    }

    setUniform(option) {
        var uniforms = {};
        for (var key in option) {
            if (key.substr(0, 2) === 'u_') {
                uniforms[key] = {value: option[key]};
            }
        }
        return uniforms;
    }

    upDateUninform(option) {
        for (var key in option) {
            if (key.substr(0, 2) === 'u_') {
                this.setUniformsValue(key, option[key]);
            }
        }
    }
}

export default Material
