export default function(ref) {
  return {
    methods: {
      focus() {
        this.$refs[ref].focus();
      }
    }
  };
};
// 同名方法， mixin会先调用